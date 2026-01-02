import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, ProductStatus } from '@prisma/client';
import {
  CreateProductDto,
  UpdateProductDto,
  ProductFilterDto,
} from './dto/product.dto';

@Injectable()
export class ProductsRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.ProductUncheckedCreateInput) {
    return this.prisma.product.create({
      data,
      include: {
        category: true,
        seller: {
          select: {
            id: true,
            name: true,
            avatar: true,
            rating: true,
            ratingCount: true,
          },
        },
      },
    });
  }

  async findAll(
    where: Prisma.ProductWhereInput,
    orderBy: Prisma.ProductOrderByWithRelationInput,
    page: number,
    limit: number,
  ) {
    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          category: true,
          seller: {
            select: {
              id: true,
              name: true,
              avatar: true,
              rating: true,
              ratingCount: true,
            },
          },
          _count: {
            select: { bids: true },
          },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return { products, total };
  }

  async findManyEndingSoon(limit: number) {
    return this.prisma.product.findMany({
      where: {
        status: ProductStatus.ACTIVE,
        endTime: { gt: new Date() },
      },
      orderBy: { endTime: 'asc' },
      take: limit,
      include: {
        category: true,
        seller: {
          select: {
            id: true,
            name: true,
            avatar: true,
            rating: true,
            ratingCount: true,
          },
        },
        _count: { select: { bids: true } },
      },
    });
  }

  async findMany(params: {
    where?: Prisma.ProductWhereInput;
    orderBy?: Prisma.ProductOrderByWithRelationInput;
    take?: number;
    include?: Prisma.ProductInclude;
  }) {
    return this.prisma.product.findMany({
      ...params,
      include: params.include || {
        _count: { select: { bids: true } },
      },
    }); // Ensure count is included or handled by caller
  }

  async findByIdOrSlug(idOrSlug: string) {
    return this.prisma.product.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
      include: {
        category: {
          include: { parent: true },
        },
        seller: {
          select: {
            id: true,
            name: true,
            avatar: true,
            rating: true,
            ratingCount: true,
            allowNewBidders: true,
          },
        },
        bids: {
          take: 1,
          orderBy: { amount: 'desc' },
          include: {
            bidder: {
              select: {
                id: true,
                name: true,
                avatar: true,
                rating: true,
                ratingCount: true,
              },
            },
          },
        },
        _count: {
          select: { bids: true, watchlist: true },
        },
      },
    });
  }

  async findUnique(where: Prisma.ProductWhereUniqueInput) {
    return this.prisma.product.findUnique({ where });
  }

  async update(
    id: string,
    data: Prisma.ProductUncheckedUpdateInput,
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx || this.prisma;
    return client.product.update({
      where: { id },
      data,
      include: {
        category: true,
        seller: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });
  }

  async delete(id: string) {
    return this.prisma.product.delete({
      where: { id },
    });
  }

  async countBid(where: Prisma.BidWhereInput) {
    return this.prisma.bid.count({ where });
  }
}
