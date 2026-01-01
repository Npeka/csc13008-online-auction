import { Module } from '@nestjs/common';
import { BidsController } from './bids.controller';
import { BidsService } from './bids.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [BidsController],
  providers: [BidsService, PrismaService],
  exports: [BidsService],
})
export class BidsModule {}
