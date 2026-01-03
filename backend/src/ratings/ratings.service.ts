import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { RatingsRepository } from './ratings.repository';
import { CreateRatingDto } from './dto/rating.dto';

@Injectable()
export class RatingsService {
  constructor(private ratingsRepository: RatingsRepository) {}

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
