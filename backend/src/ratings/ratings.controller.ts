import { Controller, Post, Get, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { CreateRatingDto, UpdateRatingDto } from './dto/rating.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('ratings')
@UseGuards(JwtAuthGuard)
export class RatingsController {
  constructor(private ratingsService: RatingsService) {}

  @Post()
  createRating(@GetUser('id') userId: string, @Body() dto: CreateRatingDto) {
    return this.ratingsService.createRating(userId, dto);
  }

  @Patch(':id')
  updateRating(
    @Param('id') ratingId: string,
    @GetUser('id') userId: string,
    @Body() dto: UpdateRatingDto,
  ) {
    return this.ratingsService.updateRating(ratingId, userId, dto);
  }

  @Get('users/:userId')
  getUserRatings(@Param('userId') userId: string) {
    return this.ratingsService.getUserRatings(userId);
  }

  @Get('me/summary')
  getMyRatingSummary(@GetUser('id') userId: string) {
    return this.ratingsService.getRatingSummary(userId);
  }

  @Get('me/received')
  getMyReceivedRatings(@GetUser('id') userId: string) {
    return this.ratingsService.getUserRatings(userId);
  }
}
