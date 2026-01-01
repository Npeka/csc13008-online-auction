import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsArray,
  Min,
  IsDateString,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsArray()
  @IsString({ each: true })
  images: string[];

  @IsString()
  categoryId: string;

  @IsNumber()
  @Min(0)
  startPrice: number;

  @IsNumber()
  @Min(0)
  bidStep: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  buyNowPrice?: number;

  @IsDateString()
  endTime: string;

  @IsOptional()
  @IsBoolean()
  autoExtend?: boolean;

  @IsOptional()
  @IsBoolean()
  allowNewBidders?: boolean;
}

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsBoolean()
  allowNewBidders?: boolean;
}

export class AppendDescriptionDto {
  @IsString()
  additionalDescription: string;
}

export class ProductFilterDto {
  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  sortBy?:
    | 'ending_asc'
    | 'ending_desc'
    | 'price_asc'
    | 'price_desc'
    | 'newest'
    | 'most_bids';

  @IsOptional()
  @IsString()
  status?: 'active' | 'ended';

  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;
}
