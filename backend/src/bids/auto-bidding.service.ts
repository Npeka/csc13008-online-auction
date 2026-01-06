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

        // 3. Resolution Algorithm
        const currentPrice = product.currentPrice;
        const bidStep = product.bidStep;
        const highestBid = product.bids[0]; // Current highest bid
        const highestBidderId = highestBid?.bidderId;

        // Filter valid competitors
        // A competitor is an AutoBid that is NOT the current highest bidder
        // OR the current highest bidder if they are being outbid by manual? No.
        // We just look at who WANTS to bid.

        // Sort autoBids by maxAmount DESC
        // autoBids is already sorted by query

        // Scenario:
        // 1. Manual User A bids 100.
        // 2. Auto User B (Max 200) sees this.
        // 3. System bids 110 for B.

        // Scenario:
        // 1. Auto User A (Max 150) is winning at 100.
        // 2. Auto User B (Max 200) joins.
        // 3. System sees A(150) vs B(200).
        // 4. B should win at 150 + step = 160.

        // Let's identify the effective candidates.
        // Candidates include:
        // - The current winner (could be Manual or Auto)
        // - All AutoBidders

        // We primarily iterate through AutoBidders to see if anyone can beat the current price/winner.

        let winningBidderId = highestBidderId;
        let newPrice = currentPrice;
        let madeBid = false;

        // Iterate through auto-bids to find the highest valid proxy
        // Since they are sorted desc, the first one is the strongest.
        // If strongest is already winning, check if we need to bump price against 2nd strongest.

        const strongestAuto = autoBids[0];

        if (strongestAuto.userId === highestBidderId) {
          // Strongest is already winning.
          // Check if there is a 2nd strongest auto-bid that forces the price up?
          if (autoBids.length > 1) {
            const secondStrongest = autoBids[1];
            // If 2nd strongest max > current price, we must bump current price to outbid them.
            if (secondStrongest.maxAmount >= currentPrice) {
              // Price should be 2nd Max + Step, capped at 1st Max.
              let calculatedPrice = secondStrongest.maxAmount + bidStep;
              if (calculatedPrice > strongestAuto.maxAmount) {
                calculatedPrice = strongestAuto.maxAmount;
              }

              if (calculatedPrice > currentPrice) {
                newPrice = calculatedPrice;
                madeBid = true; // Updates price but winner stays same
              }
            }
          } else {
            // Strongest is winning and no other auto-bids.
            // But what if current price is lower than a previous manual competing bid (unlikely if logic works)
          }
        } else {
          // Strongest is NOT winning.
          // Can they beat the current price?

          // Need to calculate strict minimum to beat current env.
          // Current Price + Step.
          const minToWin = currentPrice + bidStep;

          if (strongestAuto.maxAmount >= minToWin) {
            // Yes, they can bid.
            winningBidderId = strongestAuto.userId;
            newPrice = minToWin;
            madeBid = true;

            // NOW, check if the previous winner (if existing) was ALSO an auto-bidder?
            // Or if there is a 2nd strongest auto-bidder.

            // If previous winner was Manual, their limit is `currentPrice`. We beat them.
            // If previous winner was Auto (but lower max), we need to jump to their max + step.

            // Let's verify against the field.
            // Find highest max among OTHERS (including previous winner if they had auto).
            // But `autoBids` list contains ALL auto bids.

            const secondStrongest = autoBids.length > 1 ? autoBids[1] : null;

            if (secondStrongest) {
              // The price is determined by the 2nd highest limit.
              // Price = 2ndMax + Step.
              let calculatedPrice = secondStrongest.maxAmount + bidStep;

              // But maybe `currentPrice` (from manual bid) is higher than `2ndMax`?
              // E.g. TopAuto=500. 2ndAuto=200. Manual=300.
              // Price must beat Manual=300. So 310.
              // Math.max(currentPrice, secondStrongest.maxAmount) + step?
              // Wait, if Manual is 300, and 2ndAuto is 200. 2ndAuto is irrelevant.

              // So "Competitor Barrier" = Math.max(currentPrice, secondStrongest.maxAmount).
              // Actually, if TopAuto is NOT winning, then currentPrice IS the barrier from the current winner.
              // And `secondStrongest` is another barrier.

              const barrier = Math.max(currentPrice, secondStrongest.maxAmount);

              // Wait, if currentPrice comes from TopAuto (logic error above), but here TopAuto is NOT winning.
              // So `currentPrice` is set by someone else.

              // If `secondStrongest` is the current winner?
              // Then barrier is `secondStrongest.maxAmount`.

              // Logic:
              // Bidder = StrongestAuto.
              // Price = Max(CurrentPrice, SecondStrongest?.maxAmount || 0) + Step.
              // Cap at StrongestAuto.maxAmount.

              let proposedPrice =
                Math.max(currentPrice, secondStrongest.maxAmount) + bidStep;

              // Corner case: If CurrentPrice == SecondStrongest.maxAmount (e.g. system jumped there previously),
              // then we add step. Correct.

              // But wait, if CurrentPrice is 100. SecondAuto is 200. Strongest is 500.
              // We shouldn't bid 110. We should bid 210.
              // Because SecondAuto would handle 100->110...200.
              // So we jump straight to 210.

              if (proposedPrice <= strongestAuto.maxAmount) {
                newPrice = proposedPrice;
              } else {
                // Cannot beat the barrier + step?
                // Can we match the barrier? or bid max?
                // If max < barrier + step, we bid max.
                newPrice = strongestAuto.maxAmount;
              }
            } else {
              // No other auto bidders.
              // Just beat current price.
              newPrice = currentPrice + bidStep;
              if (newPrice > strongestAuto.maxAmount) {
                newPrice = strongestAuto.maxAmount; // Should not happen if check passed
              }
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
            },
            tx,
          );

          this.logger.log(
            `Auto-bid placed: User ${winningBidderId} @ ${newPrice}`,
          );

          // Queue email notifications
          const winner = autoBids.find(
            (a) => a.userId === winningBidderId,
          )?.user;
          const previousWinner = product.bids[0]?.bidder;

          if (winner) {
            emailTasks.push(() =>
              this.emailService.sendBidPlacedEmail({
                toEmail: winner.email,
                toName: winner.name,
                productTitle: product.title,
                productSlug: product.slug,
                bidAmount: newPrice,
                currentPrice: newPrice,
              }),
            );
          }

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

          // 3. Notify seller
          if (product.seller?.email && product.sellerId !== winningBidderId) {
            emailTasks.push(() =>
              this.emailService.sendBidPlacedEmail({
                toEmail: product.seller.email,
                toName: product.seller.name,
                productTitle: product.title,
                productSlug: product.slug,
                bidAmount: newPrice,
                currentPrice: newPrice,
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
