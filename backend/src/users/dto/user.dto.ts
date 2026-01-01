import { IsString, IsOptional, IsDateString, MinLength } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  avatar?: string;
}

export class CreateUpgradeRequestDto {
  @IsOptional()
  @IsString()
  reason?: string;
}

export class ProcessUpgradeRequestDto {
  @IsString()
  status: 'APPROVED' | 'REJECTED';

  @IsOptional()
  @IsString()
  adminComment?: string;
}
