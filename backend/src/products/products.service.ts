import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { ProductsRepository } from './products.repository';
import {
  CreateProductDto,
  UpdateProductDto,
  AppendDescriptionDto,
  ProductFilterDto,
} from './dto/product.dto';
import { ProductStatus } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private productsRepository: ProductsRepository) {}

  private generateSlug(title: string): string {
    const slug = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    return `${slug}-${Date.now().toString().slice(-6)}`;
  }

  async create(sellerId: string, dto: CreateProductDto) {
    const slug = this.generateSlug(dto.title);

    return this.productsRepository.create({
      title: dto.title,
      slug,
      description: dto.description,
      images: dto.images,
      categoryId: dto.categoryId,
      sellerId,
      startPrice: dto.startPrice,
      currentPrice: dto.startPrice,
      bidStep: dto.bidStep,
      buyNowPrice: dto.buyNowPrice,
      endTime: new Date(dto.endTime),
      autoExtend: dto.autoExtend ?? false,
      allowNewBidders: dto.allowNewBidders ?? true,
      status: ProductStatus.ACTIVE,
    });
  }

  async findAll(filters: ProductFilterDto) {
    const {
      categoryId,
      search,
      sortBy = 'newest',
      status = 'active',
      page = 1,
      limit = 20,
    } = filters;

    const where: any = {
      status: status === 'active' ? ProductStatus.ACTIVE : ProductStatus.ENDED,
    };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    let orderBy: any = { createdAt: 'desc' };
    switch (sortBy) {
      case 'ending_asc':
        orderBy = { endTime: 'asc' };
        break;
      case 'ending_desc':
        orderBy = { endTime: 'desc' };
        break;
      case 'price_asc':
        orderBy = { currentPrice: 'asc' };
        break;
      case 'price_desc':
        orderBy = { currentPrice: 'desc' };
        break;
      case 'most_bids':
        orderBy = { createdAt: 'desc' };
        break;
    }

    const { products, total } = await this.productsRepository.findAll(
      where,
      orderBy,
      page,
      limit,
    );

    // Check which products are "new" (within configured threshold)
    const newThresholdMinutes = 60; // TODO: Get from system config
    const newThreshold = new Date(Date.now() - newThresholdMinutes * 60 * 1000);

    const productsWithMeta = products.map((product) => ({
      ...product,
      bidCount: product._count.bids,
      isNew: product.createdAt > newThreshold,
    }));

    if (sortBy === 'most_bids') {
      productsWithMeta.sort((a, b) => b.bidCount - a.bidCount);
    }

    return {
      products: productsWithMeta,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findEndingSoon(limit = 5) {
    const products = await this.productsRepository.findManyEndingSoon(limit);
    return products.map((p) => ({ ...p, bidCount: p._count.bids }));
  }

  async findMostBids(limit = 5) {
    // Reusing repository logic - fetching active products sorted by creation
    // But specific 'most bids' requires fetching more and sorting in memory if database doesn't support relation count sort easily in Prisma
    // Using the same strategy as before, calling findMany via repository
    const products = await this.productsRepository.findMany({
      where: { status: ProductStatus.ACTIVE },
      orderBy: { createdAt: 'desc' },
      take: limit * 3,
      include: {
        category: true,
        seller: {
          select: {
            id: true,
            name: true,
            avatar: true,
            rating: true,
            ratingCount: true,
          },
        },
        _count: { select: { bids: true } },
      },
    });

    return products
      .sort((a, b) => b._count.bids - a._count.bids)
      .slice(0, limit)
      .map((p) => ({ ...p, bidCount: p._count.bids }));
  }

  async findHighestPrice(limit = 5) {
    const products = await this.productsRepository.findMany({
      where: { status: ProductStatus.ACTIVE },
      orderBy: { currentPrice: 'desc' },
      take: limit,
      include: {
        category: true,
        seller: {
          select: {
            id: true,
            name: true,
            avatar: true,
            rating: true,
            ratingCount: true,
          },
        },
        _count: { select: { bids: true } },
      },
    });

    return products.map((p) => ({ ...p, bidCount: p._count.bids }));
  }

  async findBySlug(idOrSlug: string) {
    const product = await this.productsRepository.findByIdOrSlug(idOrSlug);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Increment view count via repository update
    await this.productsRepository.update(product.id, {
      viewCount: { increment: 1 },
    });

    // Get related products (same category)
    const relatedProducts = await this.productsRepository.findMany({
      where: {
        categoryId: product.categoryId,
        NOT: { id: product.id },
        status: ProductStatus.ACTIVE,
      },
      take: 5,
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        _count: { select: { bids: true } },
      },
    });

    return {
      ...product,
      highestBidder: product.bids[0]?.bidder,
      bidCount: product._count.bids,
      watchCount: product._count.watchlist,
      relatedProducts: relatedProducts.map((p) => ({
        ...p,
        bidCount: p._count.bids,
      })),
    };
  }

  async update(productId: string, sellerId: string, dto: UpdateProductDto) {
    const product = await this.productsRepository.findUnique({
      id: productId,
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.sellerId !== sellerId) {
      throw new ForbiddenException('You can only update your own products');
    }

    // Check if product has bids - restrict changes if it does
    const bidCount = await this.productsRepository.countBid({
      productId,
    });

    if (bidCount > 0) {
      // Only allow certain fields to be updated after bids exist
      const { title, description, images, categoryId, ...restrictedFields } =
        dto;

      if (Object.keys(restrictedFields).length > 0) {
        throw new BadRequestException(
          'Cannot modify auction parameters after bids have been placed',
        );
      }
    }

    return this.productsRepository.update(productId, dto);
  }

  async appendDescription(
    productId: string,
    sellerId: string,
    dto: AppendDescriptionDto,
  ) {
    const product = await this.productsRepository.findUnique({
      id: productId,
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.sellerId !== sellerId) {
      throw new ForbiddenException('You can only update your own products');
    }

    const timestamp = new Date().toLocaleDateString('vi-VN');
    const appendedDescription = `${product.description}\n\n✏️ ${timestamp}\n\n${dto.additionalDescription}`;

    return this.productsRepository.update(productId, {
      description: appendedDescription,
    });
  }

  async remove(productId: string) {
    const product = await this.productsRepository.findUnique({
      id: productId,
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    await this.productsRepository.delete(productId);

    return { message: 'Product removed successfully' };
  }

  async getUserProducts(userId: string, status?: 'active' | 'ended') {
    const where: any = { sellerId: userId };

    if (status) {
      where.status =
        status === 'active' ? ProductStatus.ACTIVE : ProductStatus.ENDED;
    }

    return this.productsRepository.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        _count: { select: { bids: true } },
      },
    });
  }
}
