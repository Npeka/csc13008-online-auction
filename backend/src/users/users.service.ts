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
} from './dto/user.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

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

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.usersRepository.update(userId, {
      ...(dto.name && { name: dto.name }),
      ...(dto.address !== undefined && { address: dto.address }),
      ...(dto.phone !== undefined && { phone: dto.phone }),
      ...(dto.dateOfBirth && { dateOfBirth: new Date(dto.dateOfBirth) }),
      ...(dto.avatar !== undefined && { avatar: dto.avatar }),
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

  async getUpgradeRequests() {
    return this.usersRepository.findAllUpgradeRequests();
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
}
