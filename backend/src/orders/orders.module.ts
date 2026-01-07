import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrdersRepository } from './orders.repository';
import { PrismaService } from '../prisma/prisma.service';
import { RatingsRepository } from '../ratings/ratings.repository';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService, OrdersRepository, RatingsRepository, PrismaService],
  exports: [OrdersService],
})
export class OrdersModule {}
