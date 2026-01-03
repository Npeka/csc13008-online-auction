import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class RatingsRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.RatingUncheckedCreateInput) {
    return this.prisma.rating.create({
      data,
      include: {
        giver: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });
  }

  async findByReceiver(receiverId: string) {
    return this.prisma.rating.findMany({
      where: { receiverId },
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
  }

  async getRatingSummary(userId: string) {
    const ratings = await this.prisma.rating.findMany({
      where: { receiverId: userId },
      select: { rating: true },
    });

    const positive = ratings.filter((r) => r.rating === 1).length;
    const negative = ratings.filter((r) => r.rating === -1).length;
    const total = ratings.length;
    const percentage = total > 0 ? (positive / total) * 100 : 0;

    return { positive, negative, total, percentage };
  }

  async checkExistingRating(
    giverId: string,
    receiverId: string,
    orderId?: string,
  ) {
    return this.prisma.rating.findFirst({
      where: {
        giverId,
        receiverId,
        ...(orderId && { orderId }),
      },
    });
  }

  async updateUserRating(userId: string) {
    const summary = await this.getRatingSummary(userId);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        rating: summary.percentage / 100, // Store as 0-1 decimal
        ratingCount: summary.total,
      },
    });

    return summary;
  }
}
