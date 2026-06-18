import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AppChannel, TransactionCurrency, TransactionProvider } from '../enums';
import { ChannelRequest } from './channel.types';

export const CHANNEL_POLICY_KEY = 'lynk:channel-policy';
export type ChannelPolicy = {
  authProviders?: string[];
  paymentProviders?: TransactionProvider[];
  currencies?: TransactionCurrency[];
};

@Injectable()
export class ChannelGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<ChannelRequest>();
    const channel = request.channel;
    if (!channel && process.env.NODE_ENV === 'production') {
      throw new BadRequestException('X-Lynk-Channel is required');
    }
    const policy = this.reflector.getAllAndOverride<ChannelPolicy>(
      CHANNEL_POLICY_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (channel === AppChannel.PI_ECOSYSTEM && policy) {
      const provider = request.params?.provider as
        | TransactionProvider
        | undefined;
      const body = request.body as
        | { currency?: TransactionCurrency }
        | undefined;
      const currency = body?.currency;
      if (
        provider &&
        policy.paymentProviders &&
        !policy.paymentProviders.includes(provider)
      ) {
        throw new BadRequestException(
          'Payment provider is not allowed for this source',
        );
      }
      if (
        currency &&
        policy.currencies &&
        !policy.currencies.includes(currency)
      ) {
        throw new BadRequestException(
          'Currency is not allowed for this source',
        );
      }
    }
    return true;
  }
}
