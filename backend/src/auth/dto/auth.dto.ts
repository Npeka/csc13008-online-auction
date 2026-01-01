import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsDateString,
  Length,
} from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @MinLength(2)
  name: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;
}

export class VerifyEmailDto {
  @IsEmail()
  email: string;

  @IsString()
  @Length(6, 6)
  otpCode: string;
}

export class ResendOtpDto {
  @IsEmail()
  email: string;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class RefreshTokenDto {
  @IsString()
  refreshToken: string;
}

export class ChangePasswordDto {
  @IsString()
  currentPassword: string;

  @IsString()
  @MinLength(6)
  newPassword: string;
}

export class ForgotPasswordDto {
  @IsEmail()
  email: string;
}

export class VerifyResetOTPDto {
  @IsEmail()
  email: string;

  @IsString()
  @Length(6, 6)
  otpCode: string;
}

export class ResetPasswordDto {
  @IsEmail()
  email: string;

  @IsString()
  resetToken: string;

  @IsString()
  @MinLength(6)
  newPassword: string;
}
