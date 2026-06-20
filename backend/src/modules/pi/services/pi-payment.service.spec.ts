import { BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { AppChannel } from '../../../common/enums';
import { PiPayment, PiPaymentStatus } from '../entities/pi-payment.entity';
import { PiApiService } from './pi-api.service';
import { PiPaymentService } from './pi-payment.service';

function makePayment(overrides: Partial<PiPayment> = {}): PiPayment {
  return {
    id: 'payment-row-1',
    userId: 'user-1',
    paymentId: 'pi-payment-1',
    txid: undefined,
    amountPi: 1,
    memo: 'Lynk purchase',
    productId: 'premium-monthly',
    productType: 'PREMIUM',
    status: PiPaymentStatus.APPROVED,
    rawPayment: undefined,
    rawApprovalResponse: undefined,
    rawCompletionResponse: undefined,
    errorCode: undefined,
    errorMessage: undefined,
    channel: AppChannel.PI_ECOSYSTEM,
    approvedAt: undefined,
    completedAt: undefined,
    cancelledAt: undefined,
    failedAt: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function buildService(payment: PiPayment | null = null) {
  const payments = {
    findOne: jest.fn().mockResolvedValue(payment),
    create: jest.fn((input: Partial<PiPayment>) => makePayment(input)),
    save: jest.fn((input: Partial<PiPayment>) => Promise.resolve(input)),
  };
  const piApi = {
    approvePayment: jest.fn().mockResolvedValue({ approved: true }),
    completePayment: jest.fn().mockResolvedValue({ completed: true }),
  };

  const service = new PiPaymentService(
    payments as unknown as Repository<PiPayment>,
    piApi as unknown as PiApiService,
  );

  return { payments, piApi, service };
}

describe('PiPaymentService hardening', () => {
  it('rejects approving an existing payment owned by another user', async () => {
    const { piApi, service } = buildService(
      makePayment({ userId: 'other-user' }),
    );

    await expect(
      service.approve(
        'user-1',
        {
          paymentId: 'pi-payment-1',
          productId: 'premium-monthly',
          productType: 'PREMIUM',
        },
        AppChannel.PI_ECOSYSTEM,
      ),
    ).rejects.toThrow(BadRequestException);
    expect(piApi.approvePayment).not.toHaveBeenCalled();
  });

  it('returns idempotent approval for an already approved payment owned by the user', async () => {
    const payment = makePayment({ status: PiPaymentStatus.APPROVED });
    const { payments, piApi, service } = buildService(payment);

    const result = await service.approve(
      'user-1',
      {
        paymentId: 'pi-payment-1',
        productId: 'premium-monthly',
        productType: 'PREMIUM',
      },
      AppChannel.PI_ECOSYSTEM,
    );

    expect(result).toMatchObject({ success: true, idempotent: true });
    expect(piApi.approvePayment).not.toHaveBeenCalled();
    expect(payments.save).not.toHaveBeenCalled();
  });

  it('rejects completion replay with a different txid', async () => {
    const { piApi, service } = buildService(
      makePayment({
        status: PiPaymentStatus.COMPLETED,
        txid: 'original-txid',
      }),
    );

    await expect(
      service.complete(
        'user-1',
        { paymentId: 'pi-payment-1', txid: 'other-txid' },
        AppChannel.PI_ECOSYSTEM,
      ),
    ).rejects.toThrow(BadRequestException);
    expect(piApi.completePayment).not.toHaveBeenCalled();
  });

  it('rejects cancelling an existing payment owned by another user', async () => {
    const { service } = buildService(makePayment({ userId: 'other-user' }));

    await expect(
      service.cancel(
        'user-1',
        { paymentId: 'pi-payment-1' },
        AppChannel.PI_ECOSYSTEM,
      ),
    ).rejects.toThrow(BadRequestException);
  });
});
