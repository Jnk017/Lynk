import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';

export interface AuditLogInput {
  actorId?: string | null;
  actorUserId?: string | null;
  action: string;
  resourceType?: string | null;
  resourceId?: string | null;
  targetType?: string | null;
  targetId?: string | null;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
  userAgent?: string | null;
}

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async record(input: AuditLogInput): Promise<AuditLog> {
    const actorId = input.actorId ?? input.actorUserId ?? null;
    const resourceType = input.resourceType ?? input.targetType ?? null;
    const resourceId = input.resourceId ?? input.targetId ?? null;

    return this.auditLogRepository.save({
      action: input.action,
      actorId,
      actorUserId: actorId,
      resourceType,
      targetType: resourceType,
      resourceId,
      targetId: resourceId,
      metadata: input.metadata || {},
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
    });
  }
}
