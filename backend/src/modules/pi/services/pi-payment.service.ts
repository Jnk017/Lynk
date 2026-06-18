import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppChannel } from '../../../common/enums';
import {
  PiApprovePaymentDto,
  PiCancelPaymentDto,
  PiCompletePaymentDto,
  PiErrorPaymentDto,
} from '../dto/pi-payment.dto';
import { PiPayment, PiPaymentStatus } from '../entities/pi-payment.entity';
import { PiApiService } from './pi-api.service';

@Injectable()
export class PiPaymentService {
  constructor(
    @InjectRepository(PiPayment) private payments: Repository<PiPayment>,
    private piApi: PiApiService,
  ) {}
  assertPi(channel: AppChannel) {
    if (channel !== AppChannel.PI_ECOSYSTEM)
      throw new BadRequestException('Pi payments require the Pi source');
  }
  async approve(userId: string, dto: PiApprovePaymentDto, channel: AppChannel) {
    this.assertPi(channel);
    let payment = await this.payments.findOne({
      where: { paymentId: dto.paymentId },
    });
    if (
      payment?.status === PiPaymentStatus.APPROVED ||
      payment?.status === PiPaymentStatus.COMPLETED
    )
      return { success: true, idempotent: true, payment };
    const rawApprovalResponse = await this.piApi.approvePayment(dto.paymentId);
    payment = await this.payments.save({
      ...(payment || {}),
      userId,
      paymentId: dto.paymentId,
      productId: dto.productId,
      productType: dto.productType,
      status: PiPaymentStatus.APPROVED,
      channel,
      rawApprovalResponse,
      approvedAt: new Date(),
    });
    return { success: true, payment };
  }
  async complete(
    userId: string,
    dto: PiCompletePaymentDto,
    channel: AppChannel,
  ) {
    this.assertPi(channel);
    const payment = await this.payments.findOne({
      where: { paymentId: dto.paymentId },
    });
    if (!payment) throw new NotFoundException('Pi payment not found');
    if (payment.userId !== userId)
      throw new BadRequestException('Payment ownership mismatch');
    if (payment.status === PiPaymentStatus.COMPLETED)
      return { success: true, idempotent: true, payment };
    const rawCompletionResponse = await this.piApi.completePayment(
      dto.paymentId,
      dto.txid,
    );
    payment.txid = dto.txid;
    payment.status = PiPaymentStatus.COMPLETED;
    payment.rawCompletionResponse = rawCompletionResponse;
    payment.completedAt = new Date();
    return { success: true, payment: await this.payments.save(payment) };
  }
  async cancel(userId: string, dto: PiCancelPaymentDto, channel: AppChannel) {
    this.assertPi(channel);
    return this.terminal(userId, dto.paymentId, PiPaymentStatus.CANCELLED, {
      cancelledAt: new Date(),
    });
  }
  async error(userId: string, dto: PiErrorPaymentDto, channel: AppChannel) {
    this.assertPi(channel);
    return this.terminal(userId, dto.paymentId, PiPaymentStatus.FAILED, {
      failedAt: new Date(),
      errorCode: dto.errorCode,
      errorMessage: dto.errorMessage,
    });
  }
  private async terminal(
    userId: string,
    paymentId: string,
    status: PiPaymentStatus,
    patch: Partial<PiPayment>,
  ) {
    let p = await this.payments.findOne({ where: { paymentId } });
    if (!p)
      p = this.payments.create({
        userId,
        paymentId,
        productId: 'unknown',
        productType: 'unknown',
        status,
      });
    if (p.status === PiPaymentStatus.COMPLETED)
      return { success: true, idempotent: true, payment: p };
    Object.assign(p, patch, { status });
    return { success: true, payment: await this.payments.save(p) };
  }
}
