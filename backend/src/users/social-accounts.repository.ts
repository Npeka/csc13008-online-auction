import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SocialProvider } from '@prisma/client';

@Injectable()
export class SocialAccountsRepository {
  constructor(private prisma: PrismaService) {}

  async findByProvider(provider: SocialProvider, providerId: string) {
    return this.prisma.socialAccount.findUnique({
      where: {
        provider_providerId: {
          provider,
          providerId,
        },
      },
      include: {
        user: true,
      },
    });
  }

  async findByUserId(userId: string) {
    return this.prisma.socialAccount.findMany({
      where: { userId },
      orderBy: { linkedAt: 'desc' },
    });
  }

  async findByUserIdAndProvider(userId: string, provider: SocialProvider) {
    return this.prisma.socialAccount.findUnique({
      where: {
        userId_provider: {
          userId,
          provider,
        },
      },
    });
  }

  async create(data: {
    userId: string;
    provider: SocialProvider;
    providerId: string;
    email?: string;
    displayName?: string;
    photoUrl?: string;
  }) {
    return this.prisma.socialAccount.create({
      data,
    });
  }

  async updateLastLogin(id: string) {
    return this.prisma.socialAccount.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  }

  async delete(userId: string, provider: SocialProvider) {
    return this.prisma.socialAccount.delete({
      where: {
        userId_provider: {
          userId,
          provider,
        },
      },
    });
  }
}
