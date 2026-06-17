import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { createHmac, randomUUID, timingSafeEqual } from 'crypto';
import { TransactionProvider } from '../../../common/enums';
import {
  CreatePaymentInput,
  CreatePaymentResult,
  PaymentProvider,
  VerifyPaymentInput,
  VerifyPaymentResult,
  WebhookResult,
} from './payment-provider.interface';

@Injectable()
export class BinancePayPaymentProviderStub implements PaymentProvider {
  private readonly client: AxiosInstance;
  constructor(private readonly configService: ConfigService) {
    this.client = axios.create({
      baseURL: this.configService.get<string>('binancePay.baseUrl'),
      timeout: 10000,
    });
  }

  createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    return this.createOrder(input);
  }

  async createOrder(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    if (!input.userId || !Number.isFinite(input.amount) || input.amount <= 0)
      throw new BadRequestException('Valid userId and amount are required');
    if (this.isTestMode()) {
      const externalRef = `test_${TransactionProvider.BINANCE_PAY}_${input.userId}_${Date.now()}`;
      return {
        provider: TransactionProvider.BINANCE_PAY,
        externalRef,
        checkoutUrl: 'https://payments.test.local/binance_pay/checkout',
        metadata: { testMode: true, provider: TransactionProvider.BINANCE_PAY },
      };
    }
    const merchantTradeNo = this.asString(
      input.metadata?.merchantTradeNo,
      randomUUID(),
    );
    const nonce = randomUUID();
    const timestamp = Date.now().toString();
    const payload = {
      merchantTradeNo,
      orderAmount: input.amount,
      currency: input.currency.toUpperCase(),
      description: input.type,
      goodsDetails: [
        {
          goodsType: '01',
          goodsCategory: 'D000',
          referenceGoodsId: input.type,
          goodsName: input.type,
        },
      ],
    };
    const response = await this.client.post(
      '/binancepay/openapi/v2/order',
      payload,
      { headers: this.signedHeaders(timestamp, nonce, payload) },
    );
    const data = response.data as Record<string, unknown>;
    const order = (data.data || data) as Record<string, unknown>;
    return {
      provider: TransactionProvider.BINANCE_PAY,
      externalRef: this.asString(order.prepayId, merchantTradeNo),
      checkoutUrl:
        typeof order.checkoutUrl === 'string' ? order.checkoutUrl : undefined,
      metadata: {
        provider: TransactionProvider.BINANCE_PAY,
        merchantTradeNo,
        raw: data,
      },
    };
  }

  async queryOrder(externalRef: string): Promise<Record<string, unknown>> {
    const payload = { prepayId: externalRef };
    const response = await this.client.post(
      '/binancepay/openapi/v2/order/query',
      payload,
      {
        headers: this.signedHeaders(
          Date.now().toString(),
          randomUUID(),
          payload,
        ),
      },
    );
    return response.data as Record<string, unknown>;
  }

  async verifyPayment(input: VerifyPaymentInput): Promise<VerifyPaymentResult> {
    return this.verifyOrder(input);
  }

  async verifyOrder(input: VerifyPaymentInput): Promise<VerifyPaymentResult> {
    if (!input.externalRef)
      throw new BadRequestException('externalRef is required');
    const data = await this.queryOrder(input.externalRef);
    const order = (data.data || data) as Record<string, unknown>;
    const status = this.asString(
      order.status || order.orderStatus,
    ).toUpperCase();
    const amount = Number(order.orderAmount || order.amount);
    return {
      verified:
        ['PAID', 'SUCCESS', 'COMPLETED'].includes(status) &&
        (!input.expectedAmount || amount === input.expectedAmount),
      externalRef: input.externalRef,
      amount,
      raw: data,
    };
  }

  verifyWebhookSignature(
    payload: unknown,
    headers: Record<string, string>,
  ): boolean {
    const secret = this.configService.get<string>('binancePay.secretKey') || '';
    if (!secret && this.isTestMode()) return true;
    if (!secret)
      throw new BadRequestException('Binance Pay secret key is not configured');
    const signature =
      headers['binancepay-signature'] || headers['x-binancepay-signature'];
    const timestamp =
      headers['binancepay-timestamp'] || headers['x-binancepay-timestamp'];
    const nonce = headers['binancepay-nonce'] || headers['x-binancepay-nonce'];
    if (!signature || !timestamp || !nonce)
      throw new BadRequestException('Missing Binance Pay webhook signature');
    if (Math.abs(Date.now() - Number(timestamp)) > 5 * 60 * 1000)
      throw new BadRequestException('Stale Binance Pay webhook');
    const body =
      typeof payload === 'string' ? payload : JSON.stringify(payload);
    const expected = createHmac('sha512', secret)
      .update(`${timestamp}\n${nonce}\n${body}\n`)
      .digest('hex')
      .toUpperCase();
    const expectedBuffer = Buffer.from(expected);
    const signatureBuffer = Buffer.from(signature.toUpperCase());
    return (
      expectedBuffer.length === signatureBuffer.length &&
      timingSafeEqual(expectedBuffer, signatureBuffer)
    );
  }

  async handleWebhook(
    payload: unknown,
    headers: Record<string, string>,
  ): Promise<WebhookResult> {
    await Promise.resolve();
    if (!this.verifyWebhookSignature(payload, headers))
      throw new BadRequestException('Invalid Binance Pay webhook signature');
    const data =
      typeof payload === 'object' && payload !== null
        ? (payload as Record<string, unknown>)
        : {};
    const biz = (
      data.bizData && typeof data.bizData === 'object' ? data.bizData : data
    ) as Record<string, unknown>;
    return Promise.resolve({
      provider: TransactionProvider.BINANCE_PAY,
      externalRef: this.asString(
        biz.prepayId || biz.merchantTradeNo || data.externalRef,
      ),
      externalEventId: this.asString(
        data.bizId || data.eventId || biz.prepayId,
      ),
      processed: Boolean(biz.prepayId || biz.merchantTradeNo),
      eventType: this.asString(
        data.bizType || data.eventType,
        'binance_pay.webhook',
      ),
    });
  }

  private asString(value: unknown, fallback = ''): string {
    return typeof value === 'string' || typeof value === 'number'
      ? String(value)
      : fallback;
  }

  private isTestMode(): boolean {
    const nodeEnv = this.configService.get<string>('nodeEnv') || 'development';
    return (
      nodeEnv !== 'production' &&
      !this.configService.get<string>('binancePay.apiKey')
    );
  }

  private signedHeaders(
    timestamp: string,
    nonce: string,
    payload: unknown,
  ): Record<string, string> {
    const apiKey = this.configService.get<string>('binancePay.apiKey') || '';
    const secret = this.configService.get<string>('binancePay.secretKey') || '';
    const body = JSON.stringify(payload);
    const signature = secret
      ? createHmac('sha512', secret)
          .update(`${timestamp}\n${nonce}\n${body}\n`)
          .digest('hex')
          .toUpperCase()
      : '';
    return {
      'BinancePay-Timestamp': timestamp,
      'BinancePay-Nonce': nonce,
      'BinancePay-Certificate-SN': apiKey,
      'BinancePay-Signature': signature,
    };
  }
}
