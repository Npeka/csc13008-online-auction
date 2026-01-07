import { Injectable, Logger } from '@nestjs/common';
import { BidsRepository } from './bids.repository';
import { EmailService } from '../email/email.service';
import { ProductStatus } from '@prisma/client';

@Injectable()
export class AutoBiddingService {
  private readonly logger = new Logger(AutoBiddingService.name);

  constructor(
    private bidsRepository: BidsRepository,
    private emailService: EmailService,
  ) {}

  async processAutoBidEvent(
    eventId: string,
    productId: string,
    retryCount = 0,
  ) {
    this.logger.debug(
      `Processing auto-bid event ${eventId} for product ${productId}`,
    );

    try {
      // 1. Transaction wrapper for Atomicity
      const tasks = await this.bidsRepository.transaction(async (tx) => {
        const emailTasks: (() => Promise<void>)[] = [];
        // Mark as PROCESSING
        await this.bidsRepository.updateAuctionEventStatus(
          eventId,
          'PROCESSING',
          tx,
        );

        // 2. Fetch Data (Locking logic might be needed here in high concurrency,
        // but for now we rely on the transaction isolation provided by Prisma/PG)

        // Need to pass tx to repository methods if we want them part of this transaction.
        // But BidsRepository methods I added use tx || this.prisma, so getting the data with tx is supported?
        // Wait, findProductWithBids doesn't support tx argument in my implementation.
        // For strictly correct serialization, we should fetch inside transaction.
        // However, standard READ COMMITTED is usually fine if we don't hold lock long.
        // Let's proceed with fetching current state.

        const product = await this.bidsRepository.findProductWithBids(
          productId,
          tx,
        ); // This is outside TX in current repo impl
        // Ideally we should refactor repo to accept tx for all reads, but let's assume optimistic check or short gap.

        if (!product || product.status !== ProductStatus.ACTIVE) {
          await this.bidsRepository.updateAuctionEventStatus(
            eventId,
            'COMPLETED',
            tx,
          );
          return;
        }

        const autoBids = await this.bidsRepository.findAutoBidsByProduct(
          productId,
          tx,
        );

        if (autoBids.length === 0) {
          await this.bidsRepository.updateAuctionEventStatus(
            eventId,
            'COMPLETED',
            tx,
          );
          return;
        }

        // 3. Resolution Algorithm - Proxy Bidding
        // Rule: Bid the minimum amount needed to win, up to your maximum
        const currentPrice = product.currentPrice;
        const bidStep = product.bidStep;
        const startPrice = product.startPrice;
        const highestBid = product.bids[0]; // Current highest bid
        const highestBidderId = highestBid?.bidderId;

        let winningBidderId = highestBidderId;
        let newPrice = currentPrice;
        let madeBid = false;

        // Sort auto-bids by maxAmount DESC, then by createdAt ASC (tie-breaking)
        // Already sorted by query in DESC order

        const strongestAuto = autoBids[0];

        // Case 1: This is the FIRST bid (no one is winning yet)
        if (!highestBidderId) {
          // First autobid should start at the starting price
          winningBidderId = strongestAuto.userId;
          newPrice = startPrice;
          madeBid = true;
        }
        // Case 2: Strongest is already winning
        else if (strongestAuto.userId === highestBidderId) {
          // Check if there is a 2nd strongest auto-bid that forces the price up
          if (autoBids.length > 1) {
            const secondStrongest = autoBids[1];
            // If 2nd strongest max > current price, we must bump price
            if (secondStrongest.maxAmount > currentPrice) {
              // In proxy bidding, price goes to just enough to beat second bidder
              // That's second bidder's max (they can't go higher)
              // So winner pays: second bidder's max (not their max + step)
              let calculatedPrice = secondStrongest.maxAmount;

              // But we still need to maintain the bid step increment
              // So the actual price should be max(secondMax, currentPrice + step)
              // Actually no - in the sample, when #2 (10.8M) bids against #1 (11M)
              // The price becomes exactly 10.8M (not 10.9M)

              // This means: price = second bidder's maximum
              // Cap at winner's max
              if (calculatedPrice > strongestAuto.maxAmount) {
                calculatedPrice = strongestAuto.maxAmount;
              }

              if (calculatedPrice > currentPrice) {
                newPrice = calculatedPrice;
                madeBid = true;
              }
            }
          }
        }
        // Case 3: Strongest is NOT winning (someone else is winning)
        else {
          // Calculate minimum needed to win
          const minToWin = currentPrice + bidStep;

          if (strongestAuto.maxAmount >= minToWin) {
            winningBidderId = strongestAuto.userId;
            madeBid = true;

            // Find the highest competing bid
            // This could be the current winner OR the 2nd strongest auto-bidder
            const secondStrongest = autoBids.length > 1 ? autoBids[1] : null;

            if (secondStrongest) {
              // The barrier is the higher of: current price OR second auto-bidder's max
              const barrier = Math.max(currentPrice, secondStrongest.maxAmount);
              // Price = barrier + step (to beat them), capped at winner's max
              newPrice = Math.min(barrier + bidStep, strongestAuto.maxAmount);
            } else {
              // No other auto-bidders, just beat current price
              newPrice = Math.min(
                currentPrice + bidStep,
                strongestAuto.maxAmount,
              );
            }
          }
        }

        // 4. Execute Bid
        if (madeBid && newPrice > currentPrice) {
          await this.bidsRepository.createBid(
            {
              productId,
              bidderId: winningBidderId!,
              amount: newPrice,
            },
            tx,
          );

          await this.bidsRepository.updateProduct(
            productId,
            {
              currentPrice: newPrice,
              highestBidderId: winningBidderId!,
            },
            tx,
          );

          this.logger.log(
            `Auto-bid placed: User ${winningBidderId} @ ${newPrice}`,
          );

          // Queue email notifications
          const winner = autoBids.find((a) => a.userId === winningBidderId);
          const previousWinner = product.bids[0]?.bidder;

          // 1. Send bid confirmation to winner (bidder)
          if (winner?.user) {
            emailTasks.push(() =>
              this.emailService.sendBidderBidConfirmedEmail({
                toEmail: winner.user.email,
                toName: winner.user.name,
                productTitle: product.title,
                productSlug: product.slug,
                currentBid: newPrice,
                maxBid: winner.maxAmount,
              }),
            );
          }

          // 2. Send outbid notification to previous winner
          if (previousWinner && previousWinner.id !== winningBidderId) {
            emailTasks.push(() =>
              this.emailService.sendBidderOutbidEmail({
                toEmail: previousWinner.email,
                toName: previousWinner.name,
                productTitle: product.title,
                productSlug: product.slug,
                yourBid: product.bids[0].amount,
                newHighestBid: newPrice,
              }),
            );
          }

          // 3. Notify seller of new bid
          if (product.seller?.email && product.sellerId !== winningBidderId) {
            const bidCount = product.bids.length + 1; // Current bids + this new one
            emailTasks.push(() =>
              this.emailService.sendBidPlacedEmail({
                toEmail: product.seller.email,
                toName: product.seller.name,
                productTitle: product.title,
                productSlug: product.slug,
                bidAmount: newPrice,
                bidCount: bidCount,
              }),
            );
          }
        }

        await this.bidsRepository.updateAuctionEventStatus(
          eventId,
          'COMPLETED',
          tx,
        );

        return emailTasks;
      });

      // Execute email tasks
      if (tasks && Array.isArray(tasks)) {
        await Promise.all(
          tasks.map((t) =>
            t().catch((e) => this.logger.error('Email task failed', e)),
          ),
        );
      }
    } catch (error) {
      this.logger.error(`Failed to process auto-bid event ${eventId}`, error);

      const MAX_RETRY = 3;
      if (retryCount < MAX_RETRY) {
        this.logger.warn(
          `Retrying event ${eventId} (Attempt ${retryCount + 1}/${MAX_RETRY})`,
        );
        await this.bidsRepository.updateAuctionEventStatus(
          eventId,
          'PENDING',
          undefined, // no tx
          retryCount + 1,
        );
      } else {
        this.logger.error(`Event ${eventId} failed after ${MAX_RETRY} retries`);
        await this.bidsRepository.updateAuctionEventStatus(eventId, 'FAILED');
      }
    }
  }
}
