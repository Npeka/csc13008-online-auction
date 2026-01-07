import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { BidsRepository } from './bids.repository';
import { PlaceBidDto } from './dto/bid.dto';
import { ProductStatus } from '@prisma/client';
import { RatingsService } from '../ratings/ratings.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class BidsService {
  private readonly logger = new Logger(BidsService.name);

  constructor(
    private bidsRepository: BidsRepository,
    private ratingsService: RatingsService,
    private emailService: EmailService,
  ) {}

  async placeBid(productId: string, bidderId: string, dto: PlaceBidDto) {
    // Get product with seller info
    const product = await this.bidsRepository.findProductWithBids(productId);

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
    const isBlocked = await this.bidsRepository.findBidderBlock({
      productId,
      bidderId,
      sellerId: product.sellerId,
    });

    if (isBlocked) {
      throw new ForbiddenException(
        'You have been blocked from bidding on this product',
      );
    }

    // Check rating requirements using RatingsService
    const canBid = await this.ratingsService.canUserBid(
      bidderId,
      product.allowNewBidders,
    );

    if (!canBid) {
      const summary = await this.ratingsService.getRatingSummary(bidderId);

      if (summary.total === 0) {
        throw new ForbiddenException(
          'This seller does not allow new bidders without ratings',
        );
      } else {
        throw new ForbiddenException(
          `Your rating (${Math.round(summary.percentage)}%) is below the required 80%`,
        );
      }
    }

    // Validate max amount - must be at least minimum bid
    const minimumBid = product.currentPrice + product.bidStep;
    if (dto.maxAmount < minimumBid) {
      throw new BadRequestException(
        `Maximum bid must be at least ${minimumBid} (current price + bid step)`,
      );
    }

    // Check if there's a current winner with a higher max bid
    const currentWinnerAutoBid = product.bids[0]
      ? await this.bidsRepository.findAutoBidByUserAndProduct(
          product.bids[0].bidderId,
          productId,
        )
      : null;

    // Create bid in transaction
    const result = await this.bidsRepository.transaction(async (tx) => {
      // Always set up auto-bid for the new bidder
      await this.bidsRepository.upsertAutoBid(
        bidderId,
        productId,
        dto.maxAmount,
        tx,
      );

      let bid;
      let newPrice;
      let newWinner;

      // Case 1: No current winner OR new bidder has higher max
      if (
        !currentWinnerAutoBid ||
        dto.maxAmount > currentWinnerAutoBid.maxAmount
      ) {
        // New bidder can win
        if (!currentWinnerAutoBid) {
          // First bid - start at starting price
          newPrice = product.startPrice;
        } else {
          // Beat current winner - price goes to their max + step (or our max if lower)
          newPrice = Math.min(
            currentWinnerAutoBid.maxAmount + product.bidStep,
            dto.maxAmount,
          );
        }

        newWinner = bidderId;

        // Create bid for new winner
        bid = await this.bidsRepository.createBid(
          {
            productId,
            bidderId,
            amount: newPrice,
          },
          tx,
        );
      } else {
        // Case 2: Current winner has higher or equal max bid
        // New bidder CANNOT win - don't create bid for them
        // Just update price to new bidder's max (what they can afford)
        newPrice = dto.maxAmount;
        newWinner = product.bids[0].bidderId;

        // Create bid for current winner at the new price
        bid = await this.bidsRepository.createBid(
          {
            productId,
            bidderId: newWinner,
            amount: newPrice,
          },
          tx,
        );
      }

      // Update product current price and highest bidder
      await this.bidsRepository.updateProduct(
        productId,
        {
          currentPrice: newPrice,
          highestBidderId: newWinner,
        },
        tx,
      );

      // Don't create auto-bid event since we already processed it synchronously

      // Check auto-extend
      if (product.autoExtend) {
        const timeUntilEnd = product.endTime.getTime() - Date.now();
        const triggerMs = product.extensionTriggerTime * 60 * 1000;

        if (timeUntilEnd > 0 && timeUntilEnd < triggerMs) {
          // Extend the auction
          const extensionMs = product.extensionDuration * 60 * 1000;
          const newEndTime = new Date(Date.now() + extensionMs);

          await this.bidsRepository.updateProduct(
            productId,
            { endTime: newEndTime },
            tx,
          );
        }
      }

      return { bid, newWinner, isWinner: newWinner === bidderId };
    });

    // Send email notifications in background (Fire and Forget)
    // Note: Send notification to the person who placed the bid (whether they won or not)
    this.handleBidNotifications(
      product,
      bidderId,
      result.bid.amount,
      dto.maxAmount,
      result.isWinner,
    ).catch((err) =>
      this.logger.error('Failed to handle background bid notifications', err),
    );

    return result.bid;
  }

  /**
   * Handle email notifications asynchronously
   */
  private async handleBidNotifications(
    product: any,
    bidderId: string,
    currentBid: number,
    maxBid: number,
    isWinner: boolean,
  ) {
    try {
      // 1. Send confirmation to the bidder who placed the bid
      const bidderUser = await this.bidsRepository.findUser(bidderId);
      if (bidderUser?.email) {
        await this.emailService.sendBidderBidConfirmedEmail({
          toEmail: bidderUser.email,
          toName: bidderUser.name,
          productTitle: product.title,
          productSlug: product.slug,
          currentBid: currentBid,
          maxBid: maxBid,
        });
      }

      // 2. Send outbid notification to previous highest bidder (only if new bidder won)
      if (
        isWinner &&
        product.bids.length > 0 &&
        product.bids[0].bidderId !== bidderId
      ) {
        const previousBidder = product.bids[0].bidder;

        if (previousBidder?.email) {
          await this.emailService.sendBidderOutbidEmail({
            toEmail: previousBidder.email,
            toName: previousBidder.name,
            productTitle: product.title,
            productSlug: product.slug,
            yourBid: product.bids[0].amount,
            newHighestBid: currentBid,
          });
        }
      }

      // 3. Notify seller of new bid (always send, regardless of who wins)
      if (product.seller?.email && product.sellerId !== bidderId) {
        const bidCount = product.bids.length + 1; // Current bids + this new one
        await this.emailService.sendBidPlacedEmail({
          toEmail: product.seller.email,
          toName: product.seller.name,
          productTitle: product.title,
          productSlug: product.slug,
          bidAmount: currentBid,
          bidCount: bidCount,
        });
      }
    } catch (error) {
      this.logger.error('Error sending bid emails', error);
    }
  }

  async getBidHistory(productId: string, isAuthenticated: boolean = false) {
    // For guests, only return highestBidder info
    if (!isAuthenticated) {
      const product = await this.bidsRepository.findProductById(productId);

      if (!product) {
        throw new NotFoundException('Product not found');
      }

      if (!product.highestBidder) {
        return { highestBidder: null, bidCount: 0 };
      }

      return {
        highestBidder: {
          id: product.highestBidder.id,
          name: this.maskName(product.highestBidder.name),
          rating: product.highestBidder.rating,
          ratingCount: product.highestBidder.ratingCount,
          avatar: product.highestBidder.avatar,
        },
        bidCount: await this.bidsRepository.countBids(productId),
      };
    }

    // For authenticated users, return full bid history
    const bids = await this.bidsRepository.findManyBids({
      where: {
        productId,
        isValid: true,
      },
      orderBy: { createdAt: 'desc' },
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

  async getUserAutoBid(
    productId: string,
    userId: string,
  ): Promise<{ maxAmount: number } | null> {
    const autoBid = await this.bidsRepository.findAutoBidByUserAndProduct(
      userId,
      productId,
    );

    if (!autoBid) {
      return null;
    }

    return { maxAmount: autoBid.maxAmount };
  }

  async checkUserParticipation(productId: string, userId: string) {
    const bids = await this.bidsRepository.findUserBidsForProduct(
      userId,
      productId,
    );
    const product = await this.bidsRepository.findProductById(productId);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return {
      participated: bids.length > 0,
      isWinner: product.highestBidderId === userId,
      bidCount: bids.length,
    };
  }

  async rejectBidder(productId: string, sellerId: string, bidderId: string) {
    const product = await this.bidsRepository.findProductWithValidBids(
      productId,
      bidderId,
    );

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.sellerId !== sellerId) {
      throw new ForbiddenException('Only the seller can reject bidders');
    }

    // Create block record
    await this.bidsRepository.createBidderBlock({
      sellerId,
      bidderId,
      productId,
    });

    // Invalidate all bids from this bidder
    await this.bidsRepository.updateManyBids(
      {
        productId,
        bidderId,
      },
      {
        isValid: false,
      },
    );

    // Check if rejected bidder was the highest bidder
    const highestBid = await this.bidsRepository.findFirstBid(
      {
        productId,
        isValid: true,
      },
      { amount: 'desc' },
    );

    if (highestBid) {
      // Update product with new highest bid
      await this.bidsRepository.updateProduct(productId, {
        currentPrice: highestBid.amount,
      });
    } else {
      // No valid bids left, reset to start price
      await this.bidsRepository.updateProduct(productId, {
        currentPrice: product.startPrice,
      });
    }

    // Send notification to rejected bidder
    try {
      const bidderUser = await this.bidsRepository.findUser(bidderId);

      if (bidderUser?.email) {
        await this.emailService.sendBidderRejectedEmail({
          toEmail: bidderUser.email,
          toName: bidderUser.name,
          productTitle: product.title,
          rejectionReason: 'The seller has removed you from this auction',
        });
      }
    } catch (emailError) {
      this.logger.error('Failed to send rejection email', emailError);
    }

    return { message: 'Bidder rejected successfully' };
  }

  async addToWatchlist(userId: string, productId: string) {
    // Check if product exists (can use findProductWithBids or simple findUnique via ProductRepo if exported,
    // but better to use what we have or add checkExists to BidsRepo)
    // Since BidsRepo is for Bidding context, adding to watchlist is kinda related.
    // The previous implementation checked existing product.
    // Let's use findProductWithBids for existence check as it returns null if not found.
    const product = await this.bidsRepository.findProductWithBids(productId);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Add to watchlist (upsert to handle duplicates)
    // IMPORTANT: userId_productId is a compound unique constraint.
    const watchlist = await this.bidsRepository.upsertWatchlist(
      userId,
      productId,
    );

    return watchlist;
  }

  async removeFromWatchlist(userId: string, productId: string) {
    await this.bidsRepository.deleteWatchlist(userId, productId);

    return { message: 'Removed from watchlist' };
  }

  async getWatchlist(userId: string) {
    const watchlist = await this.bidsRepository.findWatchlist(userId);

    return watchlist.map((w) => ({
      ...w.product,
      bidCount: w.product._count.bids,
      addedToWatchlistAt: w.createdAt,
    }));
  }

  async getUserBiddingProducts(userId: string) {
    const productIds =
      await this.bidsRepository.findUserBiddingProductIds(userId);

    const [products, userBids, userAutoBids] = await Promise.all([
      this.bidsRepository.findProductsByIds(productIds),
      this.bidsRepository.findUserBidsForProducts(userId, productIds),
      this.bidsRepository.findUserAutoBidsForProducts(userId, productIds),
    ]);

    // Create maps for quick lookup
    const userBidMap = new Map(userBids.map((b) => [b.productId, b.amount]));
    const userAutoBidMap = new Map(
      userAutoBids.map((ab) => [ab.productId, ab.maxAmount]),
    );

    return products.map((p) => ({
      ...p,
      bidCount: p._count.bids,
      isHighestBidder: p.bids[0]?.bidder.id === userId,
      currentBid: p.bids[0]?.amount,
      userBid: userBidMap.get(p.id) || null,
      userMaxBid: userAutoBidMap.get(p.id) || null,
    }));
  }

  async getUserWonProducts(userId: string) {
    const products = await this.bidsRepository.findUserWonProducts(userId);

    // Filter to only products where user is the winner
    const wonProducts = products.filter((p) => p.bids[0]?.bidderId === userId);

    // Check if user has rated each seller
    const productsWithRatings = await Promise.all(
      wonProducts.map(async (product) => {
        // Check if user (giver) has rated this seller (receiver)
        const hasRated = await this.bidsRepository.checkUserRatedSeller(
          userId,
          product.sellerId,
        );

        return {
          ...product,
          hasRated,
        };
      }),
    );

    return productsWithRatings;
  }

  private maskName(name: string): string {
    if (name.length <= 4) {
      return '****';
    }
    const lastPart = name.slice(-4);
    return `****${lastPart}`;
  }
}
