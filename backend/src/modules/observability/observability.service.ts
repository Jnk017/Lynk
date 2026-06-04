import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import {
  ObservabilityEventName,
  ObservabilityProperties,
} from './observability-events';

@Injectable()
export class ObservabilityService {
  private readonly logger = new Logger(ObservabilityService.name);
  private readonly posthogApiKey?: string;
  private readonly posthogHost: string;
  private readonly sentryDsn?: string;

  constructor(private readonly configService: ConfigService) {
    this.posthogApiKey = this.configService.get<string>('posthog.apiKey');
    this.posthogHost =
      this.configService.get<string>('posthog.host') ||
      'https://app.posthog.com';
    this.sentryDsn = this.configService.get<string>('sentry.dsn');
  }

  async track(
    event: ObservabilityEventName,
    distinctId: string,
    properties: ObservabilityProperties = {},
  ): Promise<void> {
    if (!this.posthogApiKey) return;

    try {
      await axios.post(
        `${this.posthogHost.replace(/\/$/, '')}/capture/`,
        {
          api_key: this.posthogApiKey,
          event,
          distinct_id: distinctId,
          properties: this.scrubProperties(properties),
        },
        { timeout: 1500 },
      );
    } catch (error) {
      this.logger.warn(
        `PostHog event ${event} could not be delivered: ${this.getErrorMessage(error)}`,
      );
    }
  }

  captureException(
    error: unknown,
    context: ObservabilityProperties = {},
  ): void {
    if (!this.sentryDsn) return;

    // Minimal safe placeholder until the official Sentry SDK is added.
    // We deliberately avoid sending secrets/request bodies and keep runtime non-blocking.
    this.logger.error(
      `Captured exception for Sentry forwarding: ${this.getErrorMessage(error)}`,
      JSON.stringify(this.scrubProperties(context)),
    );
  }

  private scrubProperties(
    properties: ObservabilityProperties,
  ): ObservabilityProperties {
    return Object.fromEntries(
      Object.entries(properties).filter(
        ([key]) => !/token|secret|password/i.test(key),
      ),
    );
  }

  private getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'unknown error';
  }
}
