import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersRepository } from '../users/users.repository';
import { SocialAccountsRepository } from '../users/social-accounts.repository';
import { FirebaseService } from '../firebase/firebase.service';
import { EmailService } from '../email/email.service';
import {
  RegisterDto,
  VerifyEmailDto,
  ResendOtpDto,
  LoginDto,
  ChangePasswordDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dto/auth.dto';
import * as bcrypt from 'bcryptjs';
import { UserRole } from '@prisma/client';

@Injectable()
export class AuthService {
  // Centralized constants from environment variables
  private readonly JWT_SECRET: string;
  private readonly JWT_REFRESH_SECRET: string;
  private readonly JWT_ACCESS_EXPIRES_IN: number; // seconds
  private readonly JWT_REFRESH_EXPIRES_IN: number; // seconds
  private readonly OTP_EXPIRY_HOURS: number;
  private readonly PASSWORD_RESET_OTP_EXPIRY_HOURS: number;
  private readonly BCRYPT_SALT_ROUNDS: number;

  constructor(
    private usersRepository: UsersRepository,
    private socialAccountsRepository: SocialAccountsRepository,
    private firebaseService: FirebaseService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {
    // Initialize constants from environment
    this.JWT_SECRET = process.env.JWT_SECRET!;
    this.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
    this.JWT_ACCESS_EXPIRES_IN = 60 * 15; // 15 minutes
    this.JWT_REFRESH_EXPIRES_IN = 60 * 60 * 24 * 7; // 7 days
    this.OTP_EXPIRY_HOURS = 24;
    this.PASSWORD_RESET_OTP_EXPIRY_HOURS = 1;
    this.BCRYPT_SALT_ROUNDS = 12;
  }

  async register(dto: RegisterDto) {
    // Check if user exists
    const existingUser = await this.usersRepository.findByEmail(dto.email);

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(
      dto.password,
      this.BCRYPT_SALT_ROUNDS,
    );

    // Generate OTP
    const otpCode = this.generateOTP();
    const otpExpiry = new Date(
      Date.now() + this.OTP_EXPIRY_HOURS * 60 * 60 * 1000,
    );

    // Create user
    const user = await this.usersRepository.create({
      email: dto.email,
      password: hashedPassword,
      name: dto.name,
      address: dto.address,
      phone: dto.phone,
      dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
      role: UserRole.BIDDER,
      otpCode,
      otpExpiry,
      emailVerified: false,
    });

    // Send OTP email
    await this.emailService.sendOTPEmail(user.email, user.name, otpCode);
    // await this.emailService.sendVerificationOTP(user.email, otpCode);

    return {
      user,
      message:
        'Registration successful. Please check your email for verification code.',
      // For development, return OTP (remove in production)
      ...(process.env.NODE_ENV === 'development' && { otpCode }),
    };
  }

  async verifyEmail(dto: VerifyEmailDto) {
    const user = await this.usersRepository.findByEmail(dto.email);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email already verified');
    }

    if (!user.otpCode || !user.otpExpiry || user.otpExpiry < new Date()) {
      throw new BadRequestException('OTP expired. Please request a new one.');
    }

    if (user.otpCode !== dto.otpCode) {
      throw new BadRequestException('Invalid OTP code');
    }

    // Verify email
    await this.usersRepository.verifyEmail(user.id);

    // Send welcome email
    await this.emailService.sendWelcomeEmail(user.email, user.name);

    // Generate tokens
    const tokens = await this.generateAndStoreTokens(user.id, user.email);

    return {
      message: 'Email verified successfully',
      tokens,
    };
  }

  async resendOtp(dto: ResendOtpDto) {
    const user = await this.usersRepository.findByEmail(dto.email);

    if (!user) {
      // Don't reveal if email exists
      return { message: 'If the email exists, OTP has been sent.' };
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email already verified');
    }

    // Generate new OTP
    const otpCode = this.generateOTP();
    const otpExpiry = new Date(
      Date.now() + this.OTP_EXPIRY_HOURS * 60 * 60 * 1000,
    );

    // Update OTP
    await this.usersRepository.updateOtp(user.id, otpCode, otpExpiry);

    // Send OTP email
    await this.emailService.sendOTPEmail(user.email, user.name, otpCode);

    return {
      message: 'OTP sent successfully',
      ...(process.env.NODE_ENV === 'development' && { otpCode }),
    };
  }

  async login(dto: LoginDto) {
    // Find user
    const user = await this.usersRepository.findByEmail(dto.email);

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if email is verified
    if (!user.emailVerified) {
      throw new UnauthorizedException(
        'Please verify your email before logging in',
      );
    }

    // Verify password
    const passwordValid = await bcrypt.compare(dto.password, user.password);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate and store tokens
    const tokens = await this.generateAndStoreTokens(user.id, user.email);

    // Return user without password
    const { password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      tokens,
    };
  }

  async refreshTokens(refreshToken: string) {
    try {
      // Verify JWT
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.JWT_REFRESH_SECRET,
      });

      // Check if refresh token exists in database
      const tokenRecord =
        await this.usersRepository.findRefreshToken(refreshToken);

      if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }

      // Delete old refresh token
      await this.usersRepository.deleteRefreshToken(tokenRecord.id);

      // Generate new tokens
      const tokens = await this.generateAndStoreTokens(
        tokenRecord.user.id,
        tokenRecord.user.email,
      );

      const { password, ...userWithoutPassword } = tokenRecord.user;

      return {
        user: userWithoutPassword,
        tokens,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(refreshToken: string) {
    await this.usersRepository.deleteRefreshTokensByToken(refreshToken);

    return { message: 'Logged out successfully' };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.usersRepository.findById(userId);

    if (!user || !user.password) {
      throw new BadRequestException('User not found');
    }

    // Verify current password
    const passwordValid = await bcrypt.compare(
      dto.currentPassword,
      user.password,
    );
    if (!passwordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(
      dto.newPassword,
      this.BCRYPT_SALT_ROUNDS,
    );

    // Update password and invalidate all refresh tokens
    await this.usersRepository.updatePassword(userId, hashedPassword);
    await this.usersRepository.deleteAllRefreshTokens(userId);

    return { message: 'Password changed successfully. Please login again.' };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.usersRepository.findByEmail(dto.email);

    if (!user) {
      // Don't reveal if email exists
      return { message: 'If the email exists, a reset code has been sent' };
    }

    // Generate OTP for password reset
    const otpCode = this.generateOTP();
    const otpExpiry = new Date(
      Date.now() + this.PASSWORD_RESET_OTP_EXPIRY_HOURS * 60 * 60 * 1000,
    );

    // Update OTP
    await this.usersRepository.updateOtp(user.id, otpCode, otpExpiry);

    // Send password reset email
    await this.emailService.sendPasswordResetEmail(
      user.email,
      user.name,
      otpCode,
    );

    return {
      message: 'If the email exists, a reset code has been sent',
      ...(process.env.NODE_ENV === 'development' && { otpCode }),
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.usersRepository.findByEmailAndOtp(
      dto.email,
      dto.otpCode,
    );

    if (!user) {
      throw new BadRequestException('Invalid or expired OTP code');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(
      dto.newPassword,
      this.BCRYPT_SALT_ROUNDS,
    );

    // Update password, clear OTP, and invalidate all refresh tokens
    await this.usersRepository.updatePassword(user.id, hashedPassword);
    await this.usersRepository.clearOtp(user.id);
    await this.usersRepository.deleteAllRefreshTokens(user.id);

    return { message: 'Password reset successfully' };
  }

  async getProfile(userId: string) {
    return this.usersRepository.findById(userId);
  }

  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private async generateAndStoreTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.JWT_SECRET,
        expiresIn: this.JWT_ACCESS_EXPIRES_IN,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.JWT_REFRESH_SECRET,
        expiresIn: this.JWT_REFRESH_EXPIRES_IN,
      }),
    ]);

    // Store refresh token in database
    const expiresAt = new Date(Date.now() + this.JWT_REFRESH_EXPIRES_IN * 1000);

    await this.usersRepository.createRefreshToken(
      refreshToken,
      userId,
      expiresAt,
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Google OAuth Login
   * Verifies Firebase token, finds or creates user, links social account
   */
  async googleOAuthLogin(firebaseToken: string) {
    try {
      // Verify Firebase token
      const decodedToken =
        await this.firebaseService.verifyIdToken(firebaseToken);

      const { uid, email, name, picture } = decodedToken;

      if (!email) {
        throw new BadRequestException('Email is required from Google account');
      }

      // Check if social account already exists
      let socialAccount = await this.socialAccountsRepository.findByProvider(
        'GOOGLE' as any, // Will be typed correctly after Prisma generate
        uid,
      );

      let user;

      if (socialAccount) {
        // Existing social account - login
        user = socialAccount.user;

        // Update last login
        await this.socialAccountsRepository.updateLastLogin(socialAccount.id);
      } else {
        // New social account - check if email exists
        const existingUser = await this.usersRepository.findByEmail(email);

        if (existingUser) {
          // Email exists - link to existing user
          user = existingUser;
        } else {
          // Create new user
          user = await this.usersRepository.create({
            email,
            password: null, // No password for OAuth-only users
            name: name || email.split('@')[0],
            emailVerified: true, // Google already verified
            role: UserRole.BIDDER,
          });
        }

        // Create social account link
        await this.socialAccountsRepository.create({
          userId: user.id,
          provider: 'GOOGLE' as any,
          providerId: uid,
          email,
          displayName: name,
          photoUrl: picture,
        });
      }

      // Generate JWT tokens
      const tokens = await this.generateAndStoreTokens(user.id, user.email);

      // Return user without sensitive data
      const {
        password,
        otpCode,
        otpExpiry,
        resetToken,
        resetTokenExpiry,
        ...userWithoutSensitiveData
      } = user;

      return {
        user: userWithoutSensitiveData,
        tokens,
        message: socialAccount
          ? 'Login successful'
          : 'Account created and logged in',
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new UnauthorizedException(
        'Invalid Firebase token or authentication failed',
      );
    }
  }
}
