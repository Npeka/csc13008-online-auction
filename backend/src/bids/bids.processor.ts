import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { BidsRepository } from './bids.repository';
import { AutoBiddingService } from './auto-bidding.service';

@Injectable()
export class BidsProcessor {
  private readonly logger = new Logger(BidsProcessor.name);
  private isProcessing = false;

  constructor(
    private bidsRepository: BidsRepository,
    private autoBiddingService: AutoBiddingService,
  ) {}

  @Cron('*/3 * * * * *') // Every 3 seconds
  async handleAutoBids() {
    if (this.isProcessing) {
      return;
    }
    this.isProcessing = true;
    this.logger.debug('Running Cron Job Auto Bids');

    try {
      const events = await this.bidsRepository.findPendingAuctionEvents(50); // Batch 50

      if (events.length > 0) {
        // Simple grouping to run different products in parallel?
        // For now, sequential to be safe.

        for (const event of events) {
          const payload = event.payload as any;
          if (payload && payload.productId) {
            await this.autoBiddingService.processAutoBidEvent(
              event.id,
              payload.productId,
              (event as any).retryCount ?? 0,
            );
          } else {
            await this.bidsRepository.updateAuctionEventStatus(
              event.id,
              'FAILED',
            );
          }
        }
      }
    } catch (error) {
      this.logger.error('Error in BidsProcessor', error);
    } finally {
      this.isProcessing = false;
    }
  }
}
