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

    // Validate bid amount
    const minimumBid = product.currentPrice + product.bidStep;
    if (dto.amount < minimumBid) {
      throw new BadRequestException(
        `Bid must be at least ${minimumBid} (current price + bid step)`,
      );
    }

    // Validate max amount for auto-bidding
    if (dto.maxAmount) {
      if (dto.maxAmount < dto.amount) {
        throw new BadRequestException(
          'Max bid amount must be greater than or equal to your bid amount',
        );
      }
    }

    // Create bid in transaction
    const result = await this.bidsRepository.transaction(async (tx) => {
      // Create the bid
      const bid = await this.bidsRepository.createBid(
        {
          productId,
          bidderId,
          amount: dto.amount,
        },
        tx,
      );

      // Update product current price
      await this.bidsRepository.updateProduct(
        productId,
        {
          currentPrice: dto.amount,
        },
        tx,
      );

      // Handle Auto-Bidding Setup
      if (dto.maxAmount) {
        await this.bidsRepository.upsertAutoBid(
          bidderId,
          productId,
          dto.maxAmount,
          tx,
        );
      }

      // Create Event for Background Processing
      // This triggers the auto-bidding processor to check if any auto-bids need to fire
      await this.bidsRepository.createAuctionEvent(
        'PROCESS_AUTO_BID',
        { productId },
        tx,
      );

      // 5. Check auto-extend
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

      return bid;
    });

    // Send email notifications in background (Fire and Forget)
    // We pass the ORIGINAL product state (before bid) which contains previous bidder info
    // And we pass the successful bid result
    this.handleBidNotifications(product, bidderId, dto.amount).catch((err) =>
      this.logger.error('Failed to handle background bid notifications', err),
    );

    return result;
  }

  /**
   * Handle email notifications asynchronously
   */
  private async handleBidNotifications(
    product: any,
    bidderId: string,
    amount: number,
  ) {
    try {
      // 1. Send confirmation to new bidder
      const bidderUser = await this.bidsRepository.findUser(bidderId);
      if (bidderUser?.email) {
        await this.emailService.sendBidPlacedEmail({
          toEmail: bidderUser.email,
          toName: bidderUser.name,
          productTitle: product.title,
          productSlug: product.slug,
          bidAmount: amount,
          currentPrice: amount,
        });
      }

      // 2. Send outbid notification to previous highest bidder
      // product.bids is from BEFORE the new bid, so bids[0] is the person being outbid.
      if (product.bids.length > 0 && product.bids[0].bidderId !== bidderId) {
        const previousBidder = product.bids[0].bidder; // Included in findProductWithBids
        // Note: My findProductWithBids includes bidder: { id, name, email }
        // So I don't need to fetch User again if repo returns it!
        // Step 786 line 13: includes `seller`, `bids` -> `bidder` (id, name, email).
        // So I can use it directly.

        if (previousBidder?.email) {
          await this.emailService.sendBidderOutbidEmail({
            toEmail: previousBidder.email,
            toName: previousBidder.name,
            productTitle: product.title,
            productSlug: product.slug,
            yourBid: product.bids[0].amount,
            newHighestBid: amount,
          });
        }
      }

      // 3. Notify seller
      if (product.seller?.email && product.sellerId !== bidderId) {
        await this.emailService.sendBidPlacedEmail({
          toEmail: product.seller.email,
          toName: product.seller.name,
          productTitle: product.title,
          productSlug: product.slug,
          bidAmount: amount,
          currentPrice: amount,
        });
      }
    } catch (error) {
      this.logger.error('Error sending bid emails', error);
    }
  }

  async getBidHistory(productId: string) {
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

    const products = await this.bidsRepository.findProductsByIds(productIds);

    return products.map((p) => ({
      ...p,
      bidCount: p._count.bids,
      isHighestBidder: p.bids[0]?.bidder.id === userId,
      currentBid: p.bids[0]?.amount,
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
