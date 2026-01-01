import { IsNumber, Min } from 'class-validator';

export class PlaceBidDto {
  @IsNumber()
  @Min(0)
  amount: number;
}

export class RejectBidderDto {
  // No body needed - bidder ID comes from route param
}
