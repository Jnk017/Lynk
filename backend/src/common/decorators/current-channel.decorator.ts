import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AppChannel } from '../enums';
import { ChannelRequest } from '../channel/channel.types';

export const CurrentChannel = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AppChannel | undefined => {
    const request = ctx.switchToHttp().getRequest<ChannelRequest>();
    return request.channel;
  },
);
