import { IsString, IsOptional } from 'class-validator';

export class SubmitPaymentDto {
  @IsString()
  paymentProof: string;

  @IsString()
  shippingAddress: string;
}

export class ConfirmShippingDto {
  @IsString()
  shippingReceipt: string; // Tracking number
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
