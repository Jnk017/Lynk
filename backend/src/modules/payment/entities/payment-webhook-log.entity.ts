import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TransactionProvider } from '../../../common/enums';

@Entity('payment_webhook_logs')
export class PaymentWebhookLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: TransactionProvider })
  provider: TransactionProvider;

  @Column({ nullable: true })
  eventType: string;

  @Column({ nullable: true })
  externalRef: string;

  @Column({ default: false })
  processed: boolean;

  @Column({ type: 'jsonb', nullable: true })
  headers: Record<string, unknown>;

  @Column({ type: 'jsonb', nullable: true })
  payload: Record<string, unknown>;

  @Column({ nullable: true })
  errorMessage: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
