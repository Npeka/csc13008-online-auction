import { IsString, IsInt, Min, Max, IsOptional } from 'class-validator';

export class CreateRatingDto {
  @IsInt()
  @Min(-1)
  @Max(1)
  rating: number; // +1 or -1

  @IsString()
  @IsOptional()
  comment?: string;

  @IsString()
  receiverId: string;

  @IsString()
  @IsOptional()
  orderId?: string;
}

export class RatingSummaryDto {
  positive: number;
  negative: number;
  total: number;
  percentage: number;
}
