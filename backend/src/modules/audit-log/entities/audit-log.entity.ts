import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { AppChannel } from '../../../common/enums';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  action: string;

  @Column({ nullable: true })
  actorId: string;

  @Column({ nullable: true })
  actorUserId: string;

  @Column({ nullable: true })
  resourceType: string;

  @Column({ nullable: true })
  targetType: string;

  @Column({ nullable: true })
  resourceId: string;

  @Column({ nullable: true })
  targetId: string;

  @Column({ type: 'jsonb', default: '{}' })
  metadata: Record<string, unknown>;

  @Column({ nullable: true })
  ipAddress: string;

  @Column({ nullable: true })
  userAgent: string;

  @Column({
    type: 'enum',
    enum: AppChannel,
    enumName: 'app_channel_enum',
    default: AppChannel.GLOBAL,
  })
  @Index()
  channel?: AppChannel;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt: Date;
}
