import { Module } from '@nestjs/common';
import { BidsController } from './bids.controller';
import { BidsService } from './bids.service';
import { PrismaService } from '../prisma/prisma.service';
import { BidsRepository } from './bids.repository';
import { RatingsModule } from '../ratings/ratings.module';
import { EmailModule } from '../email/email.module';

import { AutoBiddingService } from './auto-bidding.service';
import { BidsProcessor } from './bids.processor';

@Module({
  imports: [RatingsModule, EmailModule],
  controllers: [BidsController],
  providers: [
    BidsService,
    PrismaService,
    BidsRepository,
    AutoBiddingService,
    BidsProcessor,
  ],
  exports: [BidsService, BidsRepository, AutoBiddingService],
})
export class BidsModule {}
