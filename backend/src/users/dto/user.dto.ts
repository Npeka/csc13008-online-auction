import {
  IsString,
  IsOptional,
  IsDateString,
  MinLength,
  IsBoolean,
} from 'class-validator';

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

export class CreateUserDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  role: 'ADMIN' | 'SELLER' | 'BIDDER';

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsBoolean()
  emailVerified?: boolean;
}

export class AdminUpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsString()
  role?: 'ADMIN' | 'SELLER' | 'BIDDER';

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsBoolean()
  emailVerified?: boolean;

  @IsOptional()
  @IsString()
  password?: string;
}
