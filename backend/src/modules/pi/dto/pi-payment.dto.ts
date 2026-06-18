import { IsIn, IsOptional, IsString } from 'class-validator';
export class PiApprovePaymentDto {
  @IsString() paymentId: string;
  @IsString() productId: string;
  @IsIn(['PREMIUM', 'BOOST', 'GIFT', 'PROFILE_VISIBILITY']) productType: string;
}
export class PiCompletePaymentDto {
  @IsString() paymentId: string;
  @IsString() txid: string;
}
export class PiCancelPaymentDto {
  @IsString() paymentId: string;
}
export class PiErrorPaymentDto {
  @IsString() paymentId: string;
  @IsOptional() @IsString() errorCode?: string;
  @IsOptional() @IsString() errorMessage?: string;
}
export class PiIncompletePaymentDto {
  payment: Record<string, unknown>;
}
