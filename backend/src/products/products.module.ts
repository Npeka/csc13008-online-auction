import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { PrismaService } from '../prisma/prisma.service';
import { ProductsRepository } from './products.repository';
import { BidsRepository } from '../bids/bids.repository';

@Module({
  controllers: [ProductsController],
  providers: [
    ProductsService,
    PrismaService,
    ProductsRepository,
    BidsRepository,
  ],
  exports: [ProductsService, ProductsRepository],
})
export class ProductsModule {}
