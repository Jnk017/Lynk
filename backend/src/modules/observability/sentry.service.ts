import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ObservabilityProperties } from './observability-events';

@Injectable()
export class SentryService implements OnModuleInit {
  private readonly logger = new Logger(SentryService.name);
  private readonly dsn?: string;
  private initialized = false;

  constructor(private readonly configService: ConfigService) {
    this.dsn = this.configService.get<string>('sentry.dsn') || undefined;
  }

  onModuleInit(): void {
    if (!this.dsn) return;
    this.initialized = true;
    process.on('uncaughtException', (error) => {
      this.captureException(error, { source: 'uncaughtException' });
    });
    process.on('unhandledRejection', (reason) => {
      this.captureException(reason, { source: 'unhandledRejection' });
    });
  }

  captureException(
    error: unknown,
    context: ObservabilityProperties & { userId?: string } = {},
  ): void {
    if (!this.initialized) return;
    this.logger.error(
      `Sentry capture: ${error instanceof Error ? error.message : 'unknown error'}`,
      JSON.stringify(this.scrub(context)),
    );
  }

  capturePaymentError(error: unknown, userId?: string): void {
    this.captureException(error, { area: 'payments', userId });
  }

  captureSessionError(error: unknown, userId?: string): void {
    this.captureException(error, { area: 'auth_session', userId });
  }

  private scrub(properties: ObservabilityProperties): ObservabilityProperties {
    return Object.fromEntries(
      Object.entries(properties).filter(
        ([key]) => !/token|secret|password|authorization/i.test(key),
      ),
    );
  }
}
