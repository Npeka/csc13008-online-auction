import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { RatingsRepository } from './ratings.repository';
import { OrdersRepository } from '../orders/orders.repository';
import { CreateRatingDto, UpdateRatingDto } from './dto/rating.dto';

@Injectable()
export class RatingsService {
  constructor(
    private ratingsRepository: RatingsRepository,
    private ordersRepository: OrdersRepository,
  ) {}

  async createRating(giverId: string, dto: CreateRatingDto) {
    // Validate rating value
    if (dto.rating !== 1 && dto.rating !== -1) {
      throw new BadRequestException('Rating must be +1 or -1');
    }

    // Cannot rate yourself
    if (giverId === dto.receiverId) {
      throw new ForbiddenException('Cannot rate yourself');
    }

    // Check for duplicate rating (same giver, receiver, and order)
    const existing = await this.ratingsRepository.checkExistingRating(
      giverId,
      dto.receiverId,
      dto.orderId,
    );

    if (existing) {
      throw new BadRequestException(
        'You have already rated this user for this transaction',
      );
    }

    // NEW: Verify order exists and user is authorized
    if (dto.orderId) {
      const order = await this.ordersRepository.findById(dto.orderId);
      if (!order) {
        throw new NotFoundException('Order not found');
      }

      // Can only rate if:
      // 1. You're the seller and rating the buyer (winner)
      // 2. You're the buyer (winner) and rating the seller
      const isSeller = order.product.sellerId === giverId;
      const isBuyer = order.buyerId === giverId;

      if (!isSeller && !isBuyer) {
        throw new ForbiddenException('You are not part of this transaction');
      }

      if (isSeller && dto.receiverId !== order.buyerId) {
        throw new ForbiddenException('Seller can only rate the winner');
      }

      if (isBuyer && dto.receiverId !== order.product.sellerId) {
        throw new ForbiddenException('Winner can only rate the seller');
      }
    }

    // Create rating
    const rating = await this.ratingsRepository.create({
      rating: dto.rating,
      comment: dto.comment,
      giverId,
      receiverId: dto.receiverId,
      orderId: dto.orderId,
    });

    // Update receiver's aggregated rating
    await this.ratingsRepository.updateUserRating(dto.receiverId);

    return rating;
  }

  async getUserRatings(userId: string) {
    const ratings = await this.ratingsRepository.findByReceiver(userId);
    const summary = await this.ratingsRepository.getRatingSummary(userId);

    return {
      ratings,
      summary,
    };
  }

  async updateRating(ratingId: string, userId: string, dto: UpdateRatingDto) {
    const rating = await this.ratingsRepository.findById(ratingId);

    if (!rating) {
      throw new NotFoundException('Rating not found');
    }

    if (rating.giverId !== userId) {
      throw new ForbiddenException('You can only update your own ratings');
    }

    // Update rating
    const updated = await this.ratingsRepository.update(ratingId, {
      rating: dto.rating,
      comment: dto.comment,
    });

    // Recalculate receiver's aggregated rating
    await this.ratingsRepository.updateUserRating(rating.receiverId);

    return updated;
  }

  async getRatingSummary(userId: string) {
    return this.ratingsRepository.getRatingSummary(userId);
  }

  // Helper method for bid validation (80% check)
  async canUserBid(userId: string, allowNewBidders: boolean): Promise<boolean> {
    const summary = await this.ratingsRepository.getRatingSummary(userId);

    // If user has no ratings yet
    if (summary.total === 0) {
      return allowNewBidders; // Depends on seller's setting
    }

    // Must have at least 80% positive rating
    return summary.percentage >= 80;
  }
}
