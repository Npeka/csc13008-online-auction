import { Module } from '@nestjs/common';
import { BidsController } from './bids.controller';
import { BidsService } from './bids.service';
import { PrismaService } from '../prisma/prisma.service';
import { BidsRepository } from './bids.repository';
import { RatingsModule } from '../ratings/ratings.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [RatingsModule, EmailModule],
  controllers: [BidsController],
  providers: [BidsService, PrismaService, BidsRepository],
  exports: [BidsService, BidsRepository],
})
export class BidsModule {}
