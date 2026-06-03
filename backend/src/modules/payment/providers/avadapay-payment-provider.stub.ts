import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TransactionProvider } from '../../../common/enums';
import { TestModePaymentProviderStub } from './test-mode-payment-provider.stub';

@Injectable()
export class AvadaPayPaymentProviderStub extends TestModePaymentProviderStub {
  constructor(configService: ConfigService) {
    super(configService, TransactionProvider.AVADAPAY);
  }
}
