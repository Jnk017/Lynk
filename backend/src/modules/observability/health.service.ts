import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { DataSource } from 'typeorm';

export type HealthStatus = 'ok' | 'degraded' | 'down';

export interface ComponentHealth {
  status: HealthStatus;
  details?: Record<string, string | boolean | number>;
}

@Injectable()
export class HealthService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
    @Optional() @InjectRedis() private readonly redis?: Redis,
  ) {}

  async check(): Promise<{
    status: HealthStatus;
    timestamp: string;
    components: Record<string, ComponentHealth>;
  }> {
    const [database, redis] = await Promise.all([
      this.checkDatabase(),
      this.checkRedis(),
    ]);
    const storage = this.checkStorageConfig();
    const queues = this.checkQueueStatus();
    const components = { database, redis, storage, queues };
    const status = Object.values(components).every(
      (component) => component.status === 'ok',
    )
      ? 'ok'
      : 'degraded';

    return {
      status,
      timestamp: new Date().toISOString(),
      components,
    };
  }

  private async checkDatabase(): Promise<ComponentHealth> {
    try {
      await this.dataSource.query('SELECT 1');
      return { status: 'ok' };
    } catch (error) {
      return {
        status: 'down',
        details: {
          message: error instanceof Error ? error.message : 'unknown',
        },
      };
    }
  }

  private async checkRedis(): Promise<ComponentHealth> {
    try {
      if (!this.redis) {
        return { status: 'degraded', details: { configured: false } };
      }
      const pong = await this.redis.ping();
      return { status: pong === 'PONG' ? 'ok' : 'degraded', details: { pong } };
    } catch (error) {
      return {
        status: 'down',
        details: {
          message: error instanceof Error ? error.message : 'unknown',
        },
      };
    }
  }

  private checkStorageConfig(): ComponentHealth {
    const bucket = this.configService.get<string>('aws.s3Bucket');
    const region = this.configService.get<string>('aws.region');

    return {
      status: bucket && region ? 'ok' : 'degraded',
      details: {
        bucketConfigured: Boolean(bucket),
        regionConfigured: Boolean(region),
      },
    };
  }

  private checkQueueStatus(): ComponentHealth {
    return {
      status: 'ok',
      details: {
        configured: false,
        message: 'No queue worker is configured yet',
      },
    };
  }
}
