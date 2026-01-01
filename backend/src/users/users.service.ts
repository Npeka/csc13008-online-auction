import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  UpdateProfileDto,
  CreateUpgradeRequestDto,
  ProcessUpgradeRequestDto,
} from './dto/user.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        address: true,
        phone: true,
        dateOfBirth: true,
        avatar: true,
        role: true,
        rating: true,
        ratingCount: true,
        emailVerified: true,
        allowNewBidders: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.address !== undefined && { address: dto.address }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.dateOfBirth && { dateOfBirth: new Date(dto.dateOfBirth) }),
        ...(dto.avatar !== undefined && { avatar: dto.avatar }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        address: true,
        phone: true,
        dateOfBirth: true,
        avatar: true,
        role: true,
        rating: true,
        ratingCount: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async getRatings(userId: string) {
    const ratings = await this.prisma.rating.findMany({
      where: { receiverId: userId },
      include: {
        giver: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

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
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== UserRole.BIDDER) {
      throw new BadRequestException('Only bidders can request upgrades');
    }

    // Check if there's already a pending request
    const existingRequest = await this.prisma.upgradeRequest.findFirst({
      where: {
        userId,
        status: 'PENDING',
      },
    });

    if (existingRequest) {
      throw new BadRequestException(
        'You already have a pending upgrade request',
      );
    }

    const request = await this.prisma.upgradeRequest.create({
      data: {
        userId,
        reason: dto.reason,
      },
    });

    return request;
  }

  async getUpgradeRequests() {
    return this.prisma.upgradeRequest.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            rating: true,
            ratingCount: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async processUpgradeRequest(
    requestId: string,
    dto: ProcessUpgradeRequestDto,
    adminId: string,
  ) {
    const request = await this.prisma.upgradeRequest.findUnique({
      where: { id: requestId },
      include: { user: true },
    });

    if (!request) {
      throw new NotFoundException('Upgrade request not found');
    }

    if (request.status !== 'PENDING') {
      throw new BadRequestException('Request has already been processed');
    }

    // Update request
    const updatedRequest = await this.prisma.upgradeRequest.update({
      where: { id: requestId },
      data: {
        status: dto.status,
        adminComment: dto.adminComment,
        reviewedBy: adminId,
        reviewedAt: new Date(),
      },
    });

    // If approved, upgrade user to seller
    if (dto.status === 'APPROVED') {
      await this.prisma.user.update({
        where: { id: request.userId },
        data: { role: UserRole.SELLER },
      });
    }

    return updatedRequest;
  }
}
