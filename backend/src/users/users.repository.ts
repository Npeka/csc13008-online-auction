import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';

export interface CreateUserData {
  email: string;
  password: string | null; // Optional for OAuth users
  name: string;
  address?: string;
  phone?: string;
  dateOfBirth?: Date | null;
  role: UserRole;
  otpCode?: string;
  otpExpiry?: Date;
  emailVerified: boolean;
}

export interface UpdateUserData {
  password?: string;
  otpCode?: string | null;
  otpExpiry?: Date | null;
  emailVerified?: boolean;
}

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

  async create(data: CreateUserData) {
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

  async update(id: string, data: UpdateUserData) {
    return this.prisma.user.update({
      where: { id },
      data,
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
}
