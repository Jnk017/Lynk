import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AppChannel } from '../../../common/enums';

export enum PiPaymentStatus {
  CREATED = 'CREATED',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  PENDING_COMPLETION = 'PENDING_COMPLETION',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED',
}

@Entity('pi_payments')
@Index(['paymentId'], { unique: true })
@Index(['txid'], { unique: true, where: '"txid" IS NOT NULL' })
export class PiPayment {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column('uuid') @Index() userId: string;
  @Column() paymentId: string;
  @Column({ nullable: true }) txid?: string;
  @Column({ type: 'decimal', precision: 18, scale: 8, default: 0 })
  amountPi: number;
  @Column({ default: 'Lynk purchase' }) memo: string;
  @Column() productId: string;
  @Column() productType: string;
  @Column({
    type: 'enum',
    enum: PiPaymentStatus,
    enumName: 'pi_payment_status_enum',
    default: PiPaymentStatus.CREATED,
  })
  status: PiPaymentStatus;
  @Column({ type: 'jsonb', nullable: true }) rawPayment?: Record<
    string,
    unknown
  >;
  @Column({ type: 'jsonb', nullable: true }) rawApprovalResponse?: Record<
    string,
    unknown
  >;
  @Column({ type: 'jsonb', nullable: true }) rawCompletionResponse?: Record<
    string,
    unknown
  >;
  @Column({ nullable: true }) errorCode?: string;
  @Column({ nullable: true }) errorMessage?: string;
  @Column({
    type: 'enum',
    enum: AppChannel,
    enumName: 'app_channel_enum',
    default: AppChannel.PI_ECOSYSTEM,
  })
  @Index()
  channel: AppChannel;
  @Column({ type: 'timestamp', nullable: true }) approvedAt?: Date;
  @Column({ type: 'timestamp', nullable: true }) completedAt?: Date;
  @Column({ type: 'timestamp', nullable: true }) cancelledAt?: Date;
  @Column({ type: 'timestamp', nullable: true }) failedAt?: Date;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
