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

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

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

    // If approved, upgrade user to seller
    if (dto.status === 'APPROVED') {
      await this.usersRepository.updateUserRole(
        request.userId,
        UserRole.SELLER,
      );
    }

    return updatedRequest;
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
}
