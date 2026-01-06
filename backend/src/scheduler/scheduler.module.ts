import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AuctionScheduler } from './auction.scheduler';
import { PrismaModule } from '../prisma/prisma.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [ScheduleModule.forRoot(), PrismaModule, EmailModule],
  providers: [AuctionScheduler],
  exports: [AuctionScheduler],
})
export class SchedulerModule {}
