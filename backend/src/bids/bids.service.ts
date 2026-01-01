import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PlaceBidDto } from './dto/bid.dto';
import { ProductStatus } from '@prisma/client';

@Injectable()
export class BidsService {
  constructor(private prisma: PrismaService) {}

  async placeBid(productId: string, bidderId: string, dto: PlaceBidDto) {
    // Get product with seller info
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        seller: true,
        bids: {
          orderBy: { amount: 'desc' },
          take: 1,
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Check if auction is still active
    if (product.status !== ProductStatus.ACTIVE) {
      throw new BadRequestException('Auction is not active');
    }

    if (new Date() > product.endTime) {
      throw new BadRequestException('Auction has ended');
    }

    // Check if bidder is the seller
    if (product.sellerId === bidderId) {
      throw new BadRequestException('You cannot bid on your own product');
    }

    // Check if bidder is blocked
    const isBlocked = await this.prisma.bidderBlock.findFirst({
      where: {
        productId,
        bidderId,
        sellerId: product.sellerId,
      },
    });

    if (isBlocked) {
      throw new ForbiddenException(
        'You have been blocked from bidding on this product',
      );
    }

    // Get bidder's rating
    const bidder = await this.prisma.user.findUnique({
      where: { id: bidderId },
    });

    if (!bidder) {
      throw new NotFoundException('Bidder not found');
    }

    // Calculate rating percentage
    const ratingPercentage =
      bidder.ratingCount > 0 ? bidder.rating / bidder.ratingCount : 0;

    // Check rating requirements
    const minRating = 0.8; // 80% - TODO: Get from system config

    if (bidder.ratingCount === 0) {
      // New bidder - check if seller allows
      if (!product.allowNewBidders && !product.seller.allowNewBidders) {
        throw new ForbiddenException(
          'This seller does not allow new bidders without ratings',
        );
      }
    } else if (ratingPercentage < minRating) {
      throw new ForbiddenException(
        `Your rating (${Math.round(ratingPercentage * 100)}%) is below the required ${Math.round(minRating * 100)}%`,
      );
    }

    // Validate bid amount
    const minimumBid = product.currentPrice + product.bidStep;
    if (dto.amount < minimumBid) {
      throw new BadRequestException(
        `Bid must be at least ${minimumBid} (current price + bid step)`,
      );
    }

    // Create bid in transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Create the bid
      const bid = await tx.bid.create({
        data: {
          productId,
          bidderId,
          amount: dto.amount,
        },
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

      // Update product current price
      await tx.product.update({
        where: { id: productId },
        data: {
          currentPrice: dto.amount,
        },
      });

      // Check auto-extend
      if (product.autoExtend) {
        const timeUntilEnd = product.endTime.getTime() - Date.now();
        const triggerMs = product.extensionTriggerTime * 60 * 1000;

        if (timeUntilEnd > 0 && timeUntilEnd < triggerMs) {
          // Extend the auction
          const extensionMs = product.extensionDuration * 60 * 1000;
          const newEndTime = new Date(Date.now() + extensionMs);

          await tx.product.update({
            where: { id: productId },
            data: { endTime: newEndTime },
          });
        }
      }

      return bid;
    });

    // TODO: Send email notifications
    // - To seller
    // - To new bidder (confirmation)
    // - To previous highest bidder (outbid notification)

    return result;
  }

  async getBidHistory(productId: string) {
    const bids = await this.prisma.bid.findMany({
      where: {
        productId,
        isValid: true,
      },
      orderBy: { createdAt: 'desc' },
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

    // Mask bidder names
    return bids.map((bid) => ({
      id: bid.id,
      amount: bid.amount,
      createdAt: bid.createdAt,
      bidder: {
        ...bid.bidder,
        name: this.maskName(bid.bidder.name),
      },
    }));
  }

  async rejectBidder(productId: string, sellerId: string, bidderId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        bids: {
          where: { bidderId, isValid: true },
          orderBy: { amount: 'desc' },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.sellerId !== sellerId) {
      throw new ForbiddenException('Only the seller can reject bidders');
    }

    // Create block record
    await this.prisma.bidderBlock.create({
      data: {
        sellerId,
        bidderId,
        productId,
      },
    });

    // Invalidate all bids from this bidder
    await this.prisma.bid.updateMany({
      where: {
        productId,
        bidderId,
      },
      data: {
        isValid: false,
      },
    });

    // Check if rejected bidder was the highest bidder
    const highestBid = await this.prisma.bid.findFirst({
      where: {
        productId,
        isValid: true,
      },
      orderBy: { amount: 'desc' },
    });

    if (highestBid) {
      // Update product with new highest bid
      await this.prisma.product.update({
        where: { id: productId },
        data: {
          currentPrice: highestBid.amount,
        },
      });
    } else {
      // No valid bids left, reset to start price
      await this.prisma.product.update({
        where: { id: productId },
        data: {
          currentPrice: product.startPrice,
        },
      });
    }

    // TODO: Send notification to rejected bidder

    return { message: 'Bidder rejected successfully' };
  }

  async addToWatchlist(userId: string, productId: string) {
    // Check if product exists
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Add to watchlist (upsert to handle duplicates)
    const watchlist = await this.prisma.watchlist.upsert({
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

    return watchlist;
  }

  async removeFromWatchlist(userId: string, productId: string) {
    await this.prisma.watchlist.delete({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    return { message: 'Removed from watchlist' };
  }

  async getWatchlist(userId: string) {
    const watchlist = await this.prisma.watchlist.findMany({
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

    return watchlist.map((w) => ({
      ...w.product,
      bidCount: w.product._count.bids,
      addedToWatchlistAt: w.createdAt,
    }));
  }

  async getUserBiddingProducts(userId: string) {
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

    const productIds = bids.map((b) => b.productId);

    const products = await this.prisma.product.findMany({
      where: {
        id: { in: productIds },
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

    return products.map((p) => ({
      ...p,
      bidCount: p._count.bids,
      isHighestBidder: p.bids[0]?.bidder.id === userId,
      currentBid: p.bids[0]?.amount,
    }));
  }

  async getUserWonProducts(userId: string) {
    // Find ended products where user has highest valid bid
    const products = await this.prisma.product.findMany({
      where: {
        status: ProductStatus.ENDED,
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

    // Filter to only products where user is the winner
    return products.filter((p) => p.bids[0]?.bidderId === userId);
  }

  private maskName(name: string): string {
    if (name.length <= 4) {
      return '****';
    }
    const lastPart = name.slice(-4);
    return `****${lastPart}`;
  }
}
