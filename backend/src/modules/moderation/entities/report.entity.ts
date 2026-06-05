import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ReportReason, ReportStatus } from '../../../common/enums';
import { User } from '../../user/entities/user.entity';

@Entity('reports')
@Index(['status'])
@Index(['reporterId'])
@Index(['reportedUserId'])
export class Report {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() reporterId: string;
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reporterId' })
  reporter: User;
  @Column() reportedUserId: string;
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reportedUserId' })
  reportedUser: User;
  @Column({ type: 'enum', enum: ReportReason, enumName: 'report_reason_enum' })
  reason: ReportReason;
  @Column({ type: 'text', nullable: true }) details: string | null;
  @Column({ type: 'text', nullable: true }) evidenceNote: string | null;
  @Column({ type: 'jsonb', default: '{}' }) metadata: Record<string, unknown>;
  @Column({
    type: 'enum',
    enum: ReportStatus,
    enumName: 'report_status_enum',
    default: ReportStatus.PENDING,
  })
  status: ReportStatus;
  @Column({ type: 'text', nullable: true }) resolutionNote: string | null;
  @Column({ nullable: true }) moderatorId: string | null;
  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'moderatorId' })
  moderator: User | null;
  @Column({ nullable: true }) resolvedAt: Date | null;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
  @DeleteDateColumn({ nullable: true }) deletedAt: Date;
}
