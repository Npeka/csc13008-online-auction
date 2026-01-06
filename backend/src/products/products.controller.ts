import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import {
  CreateProductDto,
  UpdateProductDto,
  AppendDescriptionDto,
  ProductFilterDto,
} from './dto/product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ActiveSellerGuard } from '../auth/guards/active-seller.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { UserRole } from '@prisma/client';

@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Public()
  @Get()
  findAll(@Query() filters: ProductFilterDto) {
    return this.productsService.findAll(filters);
  }

  @Public()
  @Get('ending-soon')
  findEndingSoon(@Query('limit') limit?: number) {
    return this.productsService.findEndingSoon(limit ? +limit : 5);
  }

  @Public()
  @Get('most-bids')
  findMostBids(@Query('limit') limit?: number) {
    return this.productsService.findMostBids(limit ? +limit : 5);
  }

  @Public()
  @Get('highest-price')
  findHighestPrice(@Query('limit') limit?: number) {
    return this.productsService.findHighestPrice(limit ? +limit : 5);
  }

  @Get('my-products')
  @UseGuards(JwtAuthGuard)
  getMyProducts(
    @GetUser('id') userId: string,
    @Query('status') status?: 'active' | 'ended',
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    // If pagination params provided, use paginated version
    if (page || limit) {
      return this.productsService.getUserProductsPaginated(
        userId,
        page ? +page : 1,
        limit ? +limit : 10,
        status,
        search,
      );
    }
    // Otherwise return all (for backward compatibility)
    return this.productsService.getUserProducts(userId, status);
  }

  @Get('my-products-count')
  @UseGuards(JwtAuthGuard)
  getMyProductsCount(@GetUser('id') userId: string) {
    return this.productsService.getUserProductsCount(userId);
  }

  @Get('my-products/sold')
  @UseGuards(JwtAuthGuard)
  getMySoldProducts(@GetUser('id') userId: string) {
    return this.productsService.getUserSoldProducts(userId);
  }

  @Public()
  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard, ActiveSellerGuard)
  @Roles(UserRole.SELLER, UserRole.ADMIN)
  create(@GetUser('id') userId: string, @Body() dto: CreateProductDto) {
    return this.productsService.create(userId, dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SELLER, UserRole.ADMIN)
  update(
    @Param('id') productId: string,
    @GetUser('id') userId: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.update(productId, userId, dto);
  }

  @Patch(':id/description')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SELLER, UserRole.ADMIN)
  appendDescription(
    @Param('id') productId: string,
    @GetUser('id') userId: string,
    @Body() dto: AppendDescriptionDto,
  ) {
    return this.productsService.appendDescription(productId, userId, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') productId: string) {
    return this.productsService.remove(productId);
  }
}
