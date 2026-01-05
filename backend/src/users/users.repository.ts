import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, UserRole } from '@prisma/client';

@Injectable()
export class UsersRepository {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        address: true,
        phone: true,
        dateOfBirth: true,
        role: true,
        rating: true,
        ratingCount: true,
        emailVerified: true,
        allowNewBidders: true,
        avatar: true,
        password: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findProfile(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
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
  }

  async findPublicProfile(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        avatar: true,
        role: true,
        rating: true,
        ratingCount: true,
        createdAt: true,
      },
    });
  }

  async create(data: Prisma.UserUncheckedCreateInput) {
    return this.prisma.user.create({
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true,
        createdAt: true,
      },
    });
  }

  async update(id: string, data: Prisma.UserUncheckedUpdateInput) {
    return this.prisma.user.update({
      where: { id },
      data,
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
  }

  async verifyEmail(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: {
        emailVerified: true,
        otpCode: null,
        otpExpiry: null,
      },
    });
  }

  async updatePassword(id: string, hashedPassword: string) {
    return this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });
  }

  async updateOtp(id: string, otpCode: string, otpExpiry: Date) {
    return this.prisma.user.update({
      where: { id },
      data: { otpCode, otpExpiry },
    });
  }

  async clearOtp(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: {
        otpCode: null,
        otpExpiry: null,
      },
    });
  }

  async findByEmailAndOtp(email: string, otpCode: string) {
    return this.prisma.user.findFirst({
      where: {
        email,
        otpCode,
        otpExpiry: { gt: new Date() },
      },
    });
  }

  // --- Refresh Token Methods ---

  async deleteAllRefreshTokens(userId: string) {
    return this.prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }

  async createRefreshToken(token: string, userId: string, expiresAt: Date) {
    return this.prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });
  }

  async findRefreshToken(token: string) {
    return this.prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });
  }

  async deleteRefreshToken(id: string) {
    return this.prisma.refreshToken.delete({
      where: { id },
    });
  }

  async deleteRefreshTokensByToken(token: string) {
    return this.prisma.refreshToken.deleteMany({
      where: { token },
    });
  }

  // --- Rating Methods ---

  async findRatingsForUser(userId: string) {
    return this.prisma.rating.findMany({
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
  }

  // --- Upgrade Request Methods ---

  async findPendingUpgradeRequest(userId: string) {
    return this.prisma.upgradeRequest.findFirst({
      where: {
        userId,
        status: 'PENDING',
      },
    });
  }

  async createUpgradeRequest(data: Prisma.UpgradeRequestUncheckedCreateInput) {
    return this.prisma.upgradeRequest.create({
      data,
    });
  }

  async findAllUpgradeRequests() {
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

  async findUpgradeRequestById(id: string) {
    return this.prisma.upgradeRequest.findUnique({
      where: { id },
      include: { user: true },
    });
  }

  async updateUpgradeRequest(
    id: string,
    data: Prisma.UpgradeRequestUncheckedUpdateInput,
  ) {
    return this.prisma.upgradeRequest.update({
      where: { id },
      data,
    });
  }

  async updateUserRole(id: string, role: UserRole) {
    return this.prisma.user.update({
      where: { id },
      data: { role },
    });
  }
}
