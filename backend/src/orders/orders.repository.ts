import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, OrderStatus } from '@prisma/client';

@Injectable()
export class OrdersRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    return this.prisma.order.findUnique({
      where: { id },
      include: {
        product: true,
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });
  }

  async findByProductId(productId: string) {
    return this.prisma.order.findUnique({
      where: { productId },
      include: {
        product: true,
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });
  }

  async findUserOrders(userId: string) {
    return this.prisma.order.findMany({
      where: {
        OR: [{ buyerId: userId }, { sellerId: userId }],
      },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            images: true,
          },
        },
        seller: {
          select: {
            id: true,
            name: true,
          },
        },
        buyer: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, data: Prisma.OrderUncheckedUpdateInput) {
    return this.prisma.order.update({
      where: { id },
      data,
      include: {
        product: true,
        seller: true,
        buyer: true,
      },
    });
  }

  async addMessage(orderId: string, senderId: string, content: string) {
    return this.prisma.chatMessage.create({
      data: {
        orderId,
        senderId,
        content,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });
  }
}
