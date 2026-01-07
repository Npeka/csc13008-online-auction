import { IsNumber, IsPositive, Min } from 'class-validator';

export class PlaceBidDto {
  @IsNumber()
  @IsPositive()
  @Min(0.01)
  maxAmount: number; // Maximum amount user is willing to bid (required for auto-bidding)
}

export class RejectBidderDto {
  // No body needed - bidder ID comes from route param
}
