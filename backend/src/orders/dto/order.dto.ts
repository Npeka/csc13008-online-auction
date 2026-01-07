import { IsString, IsOptional } from 'class-validator';

export class SubmitPaymentDto {
  @IsString()
  paymentProof: string;

  @IsString()
  shippingAddress: string;
}

export class ConfirmShippingDto {
  @IsString()
  shippingProof: string; // Seller's shipping receipt image URL (required)

  @IsString()
  @IsOptional()
  trackingNumber?: string; // Optional tracking number text
}

export class CancelOrderDto {
  @IsString()
  @IsOptional()
  reason?: string;
}

export class SendMessageDto {
  @IsString()
  content: string;
}
