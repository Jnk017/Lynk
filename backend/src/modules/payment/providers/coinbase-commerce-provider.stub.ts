import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TransactionProvider } from '../../../common/enums';
import { TestModePaymentProviderStub } from './test-mode-payment-provider.stub';

@Injectable()
export class CoinbaseCommerceProviderStub extends TestModePaymentProviderStub {
  constructor(configService: ConfigService) {
    super(configService, TransactionProvider.COINBASE_COMMERCE);
  }
}
