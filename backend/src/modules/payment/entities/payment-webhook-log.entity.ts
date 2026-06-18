import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AppChannel, TransactionProvider } from '../../../common/enums';

@Entity('payment_webhook_logs')
@Index(['provider', 'externalEventId'], {
  unique: true,
  where: '"externalEventId" IS NOT NULL',
})
export class PaymentWebhookLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: TransactionProvider,
    enumName: 'transaction_provider_enum',
  })
  provider: TransactionProvider;

  @Column({ nullable: true })
  eventType: string;

  @Column({ nullable: true })
  externalRef: string;

  @Column({ nullable: true })
  externalEventId: string;

  @Column({ default: false })
  processed: boolean;

  @Column({ type: 'jsonb', nullable: true })
  headers: Record<string, unknown>;

  @Column({ type: 'jsonb', nullable: true })
  payload: Record<string, unknown>;

  @Column({ nullable: true })
  errorMessage: string;

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
