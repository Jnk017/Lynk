import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { AppChannel, mapHeaderToAppChannel } from '../enums';
import { ChannelRequest } from './channel.types';

@Injectable()
export class ChannelMiddleware implements NestMiddleware {
  private readonly logger = new Logger(ChannelMiddleware.name);

  use(req: ChannelRequest, _res: Response, next: NextFunction) {
    const raw = req.header('X-Lynk-Channel');
    const mapped = mapHeaderToAppChannel(raw);
    if (mapped) {
      req.channel = mapped;
      return next();
    }
    if (process.env.NODE_ENV !== 'production') {
      req.channel = AppChannel.GLOBAL;
      this.logger.warn(
        `Missing or invalid X-Lynk-Channel (${raw ?? 'empty'}); falling back to GLOBAL outside production`,
      );
      return next();
    }
    this.logger.warn(
      `Missing or invalid X-Lynk-Channel (${raw ?? 'empty'}) in production`,
    );
    req.channel = undefined;
    next();
  }
}
