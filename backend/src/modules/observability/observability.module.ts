import { Global, Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { ObservabilityService } from './observability.service';
import { SentryService } from './sentry.service';

@Global()
@Module({
  controllers: [HealthController],
  providers: [HealthService, ObservabilityService, SentryService],
  exports: [ObservabilityService, SentryService],
})
export class ObservabilityModule {}
