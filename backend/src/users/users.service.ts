import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { UsersRepository } from './users.repository';
import {
  UpdateProfileDto,
  CreateUpgradeRequestDto,
  ProcessUpgradeRequestDto,
  CreateUserDto,
  AdminUpdateUserDto,
} from './dto/user.dto';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { EmailService } from '../email/email.service';

@Injectable()
export class UsersService {
  constructor(
    private usersRepository: UsersRepository,
    private emailService: EmailService,
  ) {}

  async getUsers(options?: {
    search?: string;
    role?: string;
    page?: number;
    limit?: number;
  }) {
    return this.usersRepository.findAll(options);
  }

  async getProfile(userId: string) {
    const startTime = Date.now();
    const user = await this.usersRepository.findProfile(userId);
    const endTime = Date.now();
    console.log(`Time taken to fetch user profile: ${endTime - startTime} ms`);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async getPublicProfile(userId: string) {
    const user = await this.usersRepository.findPublicProfile(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async getMaskedProfile(userId: string) {
    const user = await this.usersRepository.findPublicProfile(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Mask the name
    const maskedName = this.maskName(user.name);

    return {
      id: user.id,
      name: maskedName,
      avatar: user.avatar,
      role: user.role,
      rating: user.rating,
      ratingCount: user.ratingCount,
    };
  }

  private maskName(name: string): string {
    if (name.length <= 4) {
      return '****';
    }
    const lastPart = name.slice(-4);
    return `****${lastPart}`;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.usersRepository.update(userId, {
      ...(dto.name && { name: dto.name }),
      ...(dto.address !== undefined && { address: dto.address }),
      ...(dto.phone !== undefined && { phone: dto.phone }),
      ...(dto.dateOfBirth && { dateOfBirth: new Date(dto.dateOfBirth) }),
      ...(dto.avatar !== undefined && { avatar: dto.avatar }),
      ...(dto.allowNewBidders !== undefined && {
        allowNewBidders: dto.allowNewBidders,
      }),
    });

    return user;
  }

  async getRatings(userId: string) {
    const ratings = await this.usersRepository.findRatingsForUser(userId);

    const positiveCount = ratings.filter((r) => r.rating === 1).length;
    const negativeCount = ratings.filter((r) => r.rating === -1).length;
    const totalCount = ratings.length;
    const percentage = totalCount > 0 ? (positiveCount / totalCount) * 100 : 0;

    return {
      ratings,
      summary: {
        positive: positiveCount,
        negative: negativeCount,
        total: totalCount,
        percentage: Math.round(percentage),
      },
    };
  }

  async getUserCounts(userId: string) {
    const [productsCount, watchlistCount, biddingCount, wonCount] =
      await Promise.all([
        // My products count
        this.usersRepository.countUserProducts(userId),
        // Watchlist count
        this.usersRepository.countUserWatchlist(userId),
        // My bidding count
        this.usersRepository.countUserBidding(userId),
        // Won auctions count
        this.usersRepository.countUserWonAuctions(userId),
      ]);

    return {
      products: productsCount,
      watchlist: watchlistCount,
      bidding: biddingCount,
      won: wonCount,
    };
  }

  async createUpgradeRequest(userId: string, dto: CreateUpgradeRequestDto) {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== UserRole.BIDDER) {
      throw new BadRequestException('Only bidders can request upgrades');
    }

    // Check if there's already a pending request
    const existingRequest =
      await this.usersRepository.findPendingUpgradeRequest(userId);

    if (existingRequest) {
      throw new BadRequestException(
        'You already have a pending upgrade request',
      );
    }

    const request = await this.usersRepository.createUpgradeRequest({
      userId,
      reason: dto.reason,
    });

    return request;
  }

  async getUpgradeRequests(options?: {
    page?: number;
    limit?: number;
    status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  }) {
    // Lazy expiration: Check and expire old requests before fetching
    if (
      !options?.status ||
      options.status === 'PENDING' ||
      options.status === 'REJECTED'
    ) {
      await this.usersRepository.expireOldUpgradeRequests(7);
    }
    return this.usersRepository.findAllUpgradeRequests(options);
  }

  async getUserUpgradeRequests(
    userId: string,
    options?: {
      page?: number;
      limit?: number;
    },
  ) {
    return this.usersRepository.findUserUpgradeRequests(userId, options);
  }

  async processUpgradeRequest(
    requestId: string,
    dto: ProcessUpgradeRequestDto,
    adminId: string,
  ) {
    const request =
      await this.usersRepository.findUpgradeRequestById(requestId);

    if (!request) {
      throw new NotFoundException('Upgrade request not found');
    }

    if (request.status !== 'PENDING') {
      throw new BadRequestException('Request has already been processed');
    }

    // Update request
    const updatedRequest = await this.usersRepository.updateUpgradeRequest(
      requestId,
      {
        status: dto.status,
        adminComment: dto.adminComment,
        reviewedBy: adminId,
        reviewedAt: new Date(),
      },
    );

    // If approved, upgrade user to seller with 7-day temporary privilege
    if (dto.status === 'APPROVED') {
      const sellerExpiresAt = new Date();
      sellerExpiresAt.setDate(sellerExpiresAt.getDate() + 7);

      await this.usersRepository.update(request.userId, {
        role: UserRole.SELLER,
        sellerExpiresAt,
      });
    }

    return updatedRequest;
  }

  /**
   * Downgrade expired temporary sellers back to BIDDER role
   * Call this periodically (e.g., daily cron job) or manually from admin panel
   */
  async downgradeExpiredSellers() {
    return this.usersRepository.downgradeExpiredSellers();
  }

  // --- Admin User CRUD ---

  async createAdminUser(dto: CreateUserDto) {
    const existingUser = await this.usersRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12);

    return this.usersRepository.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      role: dto.role as UserRole,
      address: dto.address,
      phone: dto.phone,
      emailVerified: dto.emailVerified ?? true,
    });
  }

  async updateAdminUser(id: string, dto: AdminUpdateUserDto) {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const data: any = { ...dto };
    if (dto.password) {
      data.password = await bcrypt.hash(dto.password, 12);
    }

    return this.usersRepository.update(id, data);
  }

  async deleteUser(id: string) {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.usersRepository.delete(id);
  }

  async getAdminUser(id: string) {
    const user = await this.usersRepository.findProfile(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async adminResetPassword(id: string) {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Generate random password (8 chars)
    const newPassword = crypto.randomBytes(4).toString('hex');
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await this.usersRepository.update(id, {
      password: hashedPassword,
    });

    // Send email
    await this.emailService.sendAdminResetPasswordEmail(
      user.email,
      user.name,
      newPassword,
    );

    return { message: 'Password reset successfully' };
  }
}
