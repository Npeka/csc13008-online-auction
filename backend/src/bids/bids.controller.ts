import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { BidsService } from './bids.service';
import { PlaceBidDto } from './dto/bid.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('bids')
@UseGuards(JwtAuthGuard)
export class BidsController {
  constructor(private bidsService: BidsService) {}

  @Post('products/:productId')
  placeBid(
    @Param('productId') productId: string,
    @GetUser('id') userId: string,
    @Body() dto: PlaceBidDto,
  ) {
    return this.bidsService.placeBid(productId, userId, dto);
  }

  @Get('products/:productId/history')
  getBidHistory(@Param('productId') productId: string) {
    return this.bidsService.getBidHistory(productId);
  }

  @Post('products/:productId/reject/:bidderId')
  rejectBidder(
    @Param('productId') productId: string,
    @Param('bidderId') bidderId: string,
    @GetUser('id') sellerId: string,
  ) {
    return this.bidsService.rejectBidder(productId, sellerId, bidderId);
  }

  @Post('watchlist/:productId')
  addToWatchlist(
    @GetUser('id') userId: string,
    @Param('productId') productId: string,
  ) {
    return this.bidsService.addToWatchlist(userId, productId);
  }

  @Delete('watchlist/:productId')
  removeFromWatchlist(
    @GetUser('id') userId: string,
    @Param('productId') productId: string,
  ) {
    return this.bidsService.removeFromWatchlist(userId, productId);
  }

  @Get('watchlist')
  getWatchlist(@GetUser('id') userId: string) {
    return this.bidsService.getWatchlist(userId);
  }

  @Get('my-bidding')
  getUserBiddingProducts(@GetUser('id') userId: string) {
    return this.bidsService.getUserBiddingProducts(userId);
  }

  @Get('my-won')
  getUserWonProducts(@GetUser('id') userId: string) {
    return this.bidsService.getUserWonProducts(userId);
  }
}
