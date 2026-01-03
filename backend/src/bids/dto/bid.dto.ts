import { IsNumber, IsPositive, IsOptional, Min } from 'class-validator';

export class PlaceBidDto {
  @IsNumber()
  @IsPositive()
  @Min(0.01)
  amount: number;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  maxAmount?: number; // For auto-bidding
}

export class RejectBidderDto {
  // No body needed - bidder ID comes from route param
}
