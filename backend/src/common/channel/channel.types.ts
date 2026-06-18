import { Request } from 'express';
import { AppChannel } from '../enums';

export interface ChannelRequest extends Request {
  channel?: AppChannel;
}
