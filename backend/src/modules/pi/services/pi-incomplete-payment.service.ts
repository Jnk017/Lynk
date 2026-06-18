import { Injectable } from '@nestjs/common';
import { AppChannel } from '../../../common/enums';
import { PiApiService } from './pi-api.service';
import { PiPaymentService } from './pi-payment.service';

@Injectable()
export class PiIncompletePaymentService {
  constructor(
    private readonly piApi: PiApiService,
    private readonly payments: PiPaymentService,
  ) {}
  async recover(
    userId: string,
    payment: Record<string, unknown>,
    channel: AppChannel,
  ) {
    const candidatePaymentId =
      payment.identifier ?? payment.paymentId ?? payment.id;
    const paymentId =
      typeof candidatePaymentId === 'string' ? candidatePaymentId : '';
    const transaction = payment.transaction as
      | Record<string, unknown>
      | undefined;
    const txid =
      typeof transaction?.txid === 'string' ? transaction.txid : undefined;
    const current = paymentId
      ? await this.piApi.getPayment(paymentId)
      : payment;
    if (paymentId && txid)
      return this.payments.complete(userId, { paymentId, txid }, channel);
    return { success: true, recovered: false, payment: current };
  }
}
