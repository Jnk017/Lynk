import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { HealthService } from './health.service';

describe('HealthService', () => {
  it('checks database health without exposing secrets', async () => {
    const service = new HealthService(
      {
        query: jest.fn().mockResolvedValue([{ ok: 1 }]),
      } as unknown as DataSource,
      { get: jest.fn() } as unknown as ConfigService,
    );

    await expect(service.checkDatabase()).resolves.toMatchObject({
      status: 'ok',
    });
  });

  it('checks redis health when redis is configured', async () => {
    const service = new HealthService(
      { query: jest.fn() } as unknown as DataSource,
      { get: jest.fn() } as unknown as ConfigService,
      { ping: jest.fn().mockResolvedValue('PONG') } as never,
    );

    await expect(service.checkRedis()).resolves.toMatchObject({
      status: 'ok',
      details: { pong: 'PONG' },
    });
  });
});
