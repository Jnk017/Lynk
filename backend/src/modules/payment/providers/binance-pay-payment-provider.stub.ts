import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TransactionProvider } from '../../../common/enums';
import { TestModePaymentProviderStub } from './test-mode-payment-provider.stub';

@Injectable()
export class BinancePayPaymentProviderStub extends TestModePaymentProviderStub {
  constructor(configService: ConfigService) {
    super(configService, TransactionProvider.BINANCE_PAY);
  }
}
