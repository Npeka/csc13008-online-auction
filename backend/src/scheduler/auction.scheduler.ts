import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { ProductStatus, OrderStatus } from '@prisma/client';

@Injectable()
export class AuctionScheduler {
  private readonly logger = new Logger(AuctionScheduler.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  /**
   * Check for ended auctions every minute
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async handleEndedAuctions() {
    this.logger.debug('Checking for ended auctions...');

    try {
      // Find active products that have ended
      const endedProducts = await this.prisma.product.findMany({
        where: {
          status: ProductStatus.ACTIVE,
          endTime: {
            lte: new Date(),
          },
        },
        include: {
          seller: true,
          bids: {
            where: { isValid: true },
            orderBy: { amount: 'desc' },
            take: 10, // Get top 10 bids for notifications
            include: {
              bidder: true,
            },
          },
        },
      });

      if (endedProducts.length === 0) {
        this.logger.debug('No ended auctions found');
        return;
      }

      this.logger.log(
        `Found ${endedProducts.length} ended auctions to process`,
      );

      // Process each ended auction
      for (const product of endedProducts) {
        try {
          await this.processEndedAuction(product);
        } catch (error) {
          this.logger.error(
            `Failed to process ended auction ${product.id}: ${error.message}`,
            error.stack,
          );
        }
      }
    } catch (error) {
      this.logger.error('Error in handleEndedAuctions', error);
    }
  }

  /**
   * Process a single ended auction
   */
  private async processEndedAuction(product: any) {
    const highestBid = product.bids[0];

    // Update product status to ENDED
    await this.prisma.product.update({
      where: { id: product.id },
      data: { status: ProductStatus.ENDED },
    });

    // If there are bids, create order for winner and send notifications
    if (highestBid) {
      const winner = highestBid.bidder;

      // Create order for winner
      const order = await this.prisma.order.create({
        data: {
          productId: product.id,
          buyerId: winner.id,
          sellerId: product.sellerId,
          finalPrice: highestBid.amount,
          status: OrderStatus.PENDING_PAYMENT,
        },
      });

      this.logger.log(
        `Created order ${order.id} for auction ${product.id} - Winner: ${winner.name} (${winner.email}) - Price: $${highestBid.amount}`,
      );

      // Send email to winner
      try {
        await this.emailService.sendAuctionEndedWinnerEmail({
          toEmail: winner.email,
          toName: winner.name,
          productTitle: product.title,
          finalPrice: highestBid.amount,
          orderId: order.id,
        });
        this.logger.log(`Winner notification sent to ${winner.email}`);
      } catch (emailError) {
        this.logger.error(
          `Failed to send winner email to ${winner.email}`,
          emailError,
        );
      }

      // Send emails to non-winners (all other bidders)
      const nonWinners = product.bids.slice(1); // Skip first (winner)

      for (const bid of nonWinners) {
        try {
          await this.emailService.sendAuctionEndedNonWinnerEmail({
            toEmail: bid.bidder.email,
            toName: bid.bidder.name,
            productTitle: product.title,
            productSlug: product.slug,
            finalPrice: highestBid.amount,
            winnerName: this.maskName(winner.name),
          });
          this.logger.debug(
            `Non-winner notification sent to ${bid.bidder.email}`,
          );
        } catch (emailError) {
          this.logger.error(
            `Failed to send non-winner email to ${bid.bidder.email}`,
            emailError,
          );
        }
      }

      this.logger.log(
        `Auction ${product.id} (${product.title}) ended - Winner: ${winner.name} - Final Price: $${highestBid.amount} - Notified ${nonWinners.length} non-winners`,
      );
    } else {
      // No bids - just mark as ended
      this.logger.log(
        `Auction ${product.id} (${product.title}) ended with no bids`,
      );
    }
  }

  /**
   * Mask bidder name for privacy
   */
  private maskName(name: string): string {
    if (name.length <= 4) {
      return '****';
    }
    const lastPart = name.slice(-4);
    return `****${lastPart}`;
  }
}
