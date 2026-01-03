import { Module } from '@nestjs/common';
import { RatingsController } from './ratings.controller';
import { RatingsService } from './ratings.service';
import { RatingsRepository } from './ratings.repository';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [RatingsController],
  providers: [RatingsService, RatingsRepository, PrismaService],
  exports: [RatingsService], // Export for use in BidsService
})
export class RatingsModule {}
