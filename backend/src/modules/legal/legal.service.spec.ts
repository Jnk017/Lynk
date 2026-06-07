/* eslint-disable @typescript-eslint/no-unsafe-return, @typescript-eslint/require-await, @typescript-eslint/no-unnecessary-type-assertion */
import * as bcrypt from 'bcrypt';
import { DataSource, Repository } from 'typeorm';
import { LegalService } from './legal.service';
import { LegalAcceptance } from './entities/legal-acceptance.entity';
import { User } from '../user/entities/user.entity';
import { AuditLogService } from '../audit-log/audit-log.service';

describe('LegalService privacy lifecycle', () => {
  const userId = '713c9627-6731-43d6-9c1e-811c51122121';
  let user: Partial<User>;
  let service: LegalService;
  let acceptanceRepository: {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
  };
  let userRepository: { findOne: jest.Mock; save: jest.Mock };
  let audit: { record: jest.Mock };

  beforeEach(async () => {
    user = {
      id: userId,
      passwordHash: await bcrypt.hash('StrongPassword123', 4),
    };
    acceptanceRepository = {
      findOne: jest.fn(),
      create: jest.fn((v) => v),
      save: jest.fn(async (v) => ({
        id: 'acceptance-id',
        acceptedAt: new Date(),
        ...v,
      })),
      find: jest.fn(async () => []),
    };
    userRepository = {
      findOne: jest.fn(async () => user),
      save: jest.fn(async (v) => v),
    };
    audit = { record: jest.fn(async (v) => v) };
    service = new LegalService(
      acceptanceRepository as unknown as Repository<LegalAcceptance>,
      userRepository as unknown as Repository<User>,
      audit as unknown as AuditLogService,
      { query: jest.fn(async () => []) } as unknown as DataSource,
    );
  });

  it('records versioned acceptance with request evidence', async () => {
    const result = await service.accept(
      userId,
      {
        documentType: 'terms',
        documentVersion: '2.0',
        language: 'fr' as never,
      },
      { ipAddress: '127.0.0.1', userAgent: 'jest' },
    );
    expect(result.documentVersion).toBe('2.0');
    expect(audit.record).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'legal.acceptance',
        actorUserId: userId,
      }),
    );
  });

  it('starts a cancellable 30-day deletion grace period after password verification', async () => {
    const result = await service.requestDeletion(
      userId,
      { password: 'StrongPassword123', confirmDeletion: true },
      { userAgent: 'jest' },
    );
    expect(result.status).toBe('grace_period');
    expect(user.deletionRequestedAt).toBeInstanceOf(Date);
    expect(
      user.deletionScheduledFor!.getTime() -
        user.deletionRequestedAt!.getTime(),
    ).toBe(30 * 24 * 60 * 60 * 1000);
    expect(audit.record).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'privacy.deletion_requested' }),
    );
  });
});
