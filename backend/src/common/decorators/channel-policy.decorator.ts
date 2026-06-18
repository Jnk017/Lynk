import { SetMetadata } from '@nestjs/common';
import {
  CHANNEL_POLICY_KEY,
  ChannelPolicy as ChannelPolicyConfig,
} from '../channel/channel.guard';

export const ChannelPolicy = (policy: ChannelPolicyConfig) =>
  SetMetadata(CHANNEL_POLICY_KEY, policy);
