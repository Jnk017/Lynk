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

  async checkDatabase(): Promise<ComponentHealth & { timestamp: string }> {
    try {
      await this.dataSource.query('SELECT 1');
      return { status: 'ok', timestamp: new Date().toISOString() };
    } catch (error) {
      return {
        status: 'down',
        timestamp: new Date().toISOString(),
        details: {
          message: error instanceof Error ? error.message : 'unknown',
        },
      };
    }
  }

  async checkRedis(): Promise<ComponentHealth & { timestamp: string }> {
    try {
      if (!this.redis) {
        return {
          status: 'degraded',
          timestamp: new Date().toISOString(),
          details: { configured: false },
        };
      }
      const pong = await this.redis.ping();
      return {
        status: pong === 'PONG' ? 'ok' : 'degraded',
        timestamp: new Date().toISOString(),
        details: { pong },
      };
    } catch (error) {
      return {
        status: 'down',
        timestamp: new Date().toISOString(),
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
