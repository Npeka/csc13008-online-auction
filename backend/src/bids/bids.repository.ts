import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class BidsRepository {
  constructor(private prisma: PrismaService) {}

  async findProductWithBids(id: string, tx?: Prisma.TransactionClient) {
    const client = tx || this.prisma;
    return client.product.findUnique({
      where: { id },
      include: {
        seller: true,
        bids: {
          orderBy: { amount: 'desc' },
          take: 1,
          include: {
            bidder: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  async findBidderBlock(params: {
    productId: string;
    bidderId: string;
    sellerId: string;
  }) {
    return this.prisma.bidderBlock.findFirst({
      where: params,
    });
  }

  async findUser(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  /**
   * Execute a transaction
   */
  async transaction<T>(
    fn: (tx: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    return this.prisma.$transaction(fn);
  }

  async createBid(
    data: Prisma.BidUncheckedCreateInput,
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx || this.prisma;
    return client.bid.create({
      data,
      include: {
        bidder: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });
  }

  async updateProduct(
    id: string,
    data: Prisma.ProductUncheckedUpdateInput,
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx || this.prisma;
    return client.product.update({
      where: { id },
      data,
    });
  }

  async findManyBids(params: {
    where: Prisma.BidWhereInput;
    orderBy?: Prisma.BidOrderByWithRelationInput;
  }) {
    return this.prisma.bid.findMany({
      where: params.where,
      orderBy: params.orderBy,
      include: {
        bidder: {
          select: {
            id: true,
            name: true,
            rating: true,
            ratingCount: true,
          },
        },
      },
    });
  }

  async findProductById(id: string) {
    return this.prisma.product.findUnique({
      where: { id },
      include: {
        highestBidder: {
          select: {
            id: true,
            name: true,
            rating: true,
            ratingCount: true,
            avatar: true,
          },
        },
      },
    });
  }

  async countBids(productId: string) {
    return this.prisma.bid.count({
      where: {
        productId,
        isValid: true,
      },
    });
  }

  async findProductWithValidBids(productId: string, bidderId: string) {
    return this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        bids: {
          where: { bidderId, isValid: true },
          orderBy: { amount: 'desc' },
        },
      },
    });
  }

  async createBidderBlock(data: Prisma.BidderBlockUncheckedCreateInput) {
    return this.prisma.bidderBlock.create({ data });
  }

  async updateManyBids(
    where: Prisma.BidWhereInput,
    data: Prisma.BidUncheckedUpdateInput,
  ) {
    return this.prisma.bid.updateMany({
      where,
      data,
    });
  }

  async findFirstBid(
    where: Prisma.BidWhereInput,
    orderBy: Prisma.BidOrderByWithRelationInput,
  ) {
    return this.prisma.bid.findFirst({
      where,
      orderBy,
    });
  }

  async upsertWatchlist(userId: string, productId: string) {
    return this.prisma.watchlist.upsert({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
      create: {
        userId,
        productId,
      },
      update: {},
    });
  }

  async deleteWatchlist(userId: string, productId: string) {
    return this.prisma.watchlist.delete({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });
  }

  async findWatchlist(userId: string) {
    return this.prisma.watchlist.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            category: true,
            seller: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
            _count: {
              select: { bids: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findUserBiddingProductIds(userId: string) {
    const bids = await this.prisma.bid.findMany({
      where: {
        bidderId: userId,
        isValid: true,
      },
      select: {
        productId: true,
      },
      distinct: ['productId'],
    });
    return bids.map((b) => b.productId);
  }

  async findProductsByIds(ids: string[]) {
    return this.prisma.product.findMany({
      where: {
        id: { in: ids },
      },
      include: {
        category: true,
        seller: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        bids: {
          where: { isValid: true },
          orderBy: { amount: 'desc' },
          take: 1,
          include: {
            bidder: {
              select: { id: true, name: true },
            },
          },
        },
        _count: {
          select: { bids: true },
        },
      },
    });
  }

  async findUserWonProducts(userId: string) {
    // Note: Complex filtering logic originally in service is better kept in service
    // Repository just fetches the candidates
    // But since the service filters in memory, we can just fetch the candidates needed
    // The original query was:
    /*
      where: {
        status: ProductStatus.ENDED,
        bids: {
          some: {
            bidderId: userId,
            isValid: true,
          },
        },
      },
    */
    return this.prisma.product.findMany({
      where: {
        status: 'ENDED', // Using string or import enum
        bids: {
          some: {
            bidderId: userId,
            isValid: true,
          },
        },
      },
      include: {
        bids: {
          where: { isValid: true },
          orderBy: { amount: 'desc' },
          take: 1,
        },
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

  async checkUserRatedSeller(
    giverId: string,
    receiverId: string,
  ): Promise<boolean> {
    const rating = await this.prisma.rating.findFirst({
      where: {
        giverId,
        receiverId,
      },
    });
    return !!rating;
  }

  // Auto-Bidding Methods

  async upsertAutoBid(
    userId: string,
    productId: string,
    maxAmount: number,
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx || this.prisma;
    return client.autoBid.upsert({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
      create: {
        userId,
        productId,
        maxAmount,
      },
      update: {
        maxAmount,
      },
    });
  }

  async createAuctionEvent(
    type: string,
    payload: any,
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx || this.prisma;
    return client.auctionEvent.create({
      data: {
        type,
        payload,
        status: 'PENDING', // Using string default pending
      },
    });
  }

  async findPendingAuctionEvents(limit = 10) {
    return this.prisma.auctionEvent.findMany({
      where: {
        status: 'PENDING',
      },
      orderBy: {
        createdAt: 'asc',
      },
      take: limit,
    });
  }

  async updateAuctionEventStatus(
    id: string,
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED',
    tx?: Prisma.TransactionClient,
    retryCount?: number,
  ) {
    const client = tx || this.prisma;
    return client.auctionEvent.update({
      where: { id },
      data: {
        status,
        ...(retryCount !== undefined && { retryCount }),
      },
    });
  }

  async findAutoBidsByProduct(
    productId: string,
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx || this.prisma;
    return client.autoBid.findMany({
      where: { productId },
      orderBy: { maxAmount: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async findAutoBidByUserAndProduct(
    userId: string,
    productId: string,
  ) {
    return this.prisma.autoBid.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });
  }

  async findUserBidsForProduct(userId: string, productId: string) {
    return this.prisma.bid.findMany({
      where: {
        bidderId: userId,
        productId,
        isValid: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
