import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TransactionProvider } from '../../../common/enums';
import { TestModePaymentProviderStub } from './test-mode-payment-provider.stub';

@Injectable()
export class MonerooPaymentProviderStub extends TestModePaymentProviderStub {
  constructor(configService: ConfigService) {
    super(configService, TransactionProvider.MONEROO);
  }
}
