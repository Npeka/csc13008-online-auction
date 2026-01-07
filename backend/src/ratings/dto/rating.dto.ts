import { IsString, IsInt, Min, Max, IsOptional, MaxLength, IsIn } from 'class-validator';

export class CreateRatingDto {
  @IsInt()
  @IsIn([1, -1])
  rating: number; // +1 or -1

  @IsString()
  @IsOptional()
  @MaxLength(500)
  comment?: string;

  @IsString()
  receiverId: string;

  @IsString()
  @IsOptional()
  orderId?: string;
}

export class UpdateRatingDto {
  @IsInt()
  @IsIn([1, -1])
  rating: number; // +1 or -1

  @IsString()
  @IsOptional()
  @MaxLength(500)
  comment?: string;
}

export class RatingSummaryDto {
  positive: number;
  negative: number;
  total: number;
  percentage: number;
}
