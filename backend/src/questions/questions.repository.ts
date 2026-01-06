import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class QuestionsRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.QuestionUncheckedCreateInput) {
    return this.prisma.question.create({
      data,
      include: {
        asker: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });
  }

  async findByProduct(productId: string) {
    return this.prisma.question.findMany({
      where: { productId },
      include: {
        asker: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        answers: {
          include: {
            answerer: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    return this.prisma.question.findUnique({
      where: { id },
      include: {
        asker: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        product: {
          select: {
            id: true,
            title: true,
            slug: true,
            sellerId: true,
            seller: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        answers: true,
      },
    });
  }

  async createAnswer(
    questionId: string,
    answererId: string,
    answerText: string,
  ) {
    return this.prisma.answer.create({
      data: {
        questionId,
        answerId: answererId,
        answer: answerText,
      },
      include: {
        answerer: true,
        question: {
          include: {
            product: true,
            asker: true,
          },
        },
      },
    });
  }
}
