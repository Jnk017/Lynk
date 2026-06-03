import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import {
  TransactionType,
  TransactionCurrency,
  TransactionProvider,
  TransactionStatus,
} from '../../../common/enums';
import { User } from '../../user/entities/user.entity';

@Entity('transactions')
@Index(['provider'])
@Index(['externalRef'])
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({
    type: 'enum',
    enum: TransactionType,
    enumName: 'transaction_type_enum',
  })
  type: TransactionType;

  @Column({
    type: 'enum',
    enum: TransactionCurrency,
    enumName: 'transaction_currency_enum',
  })
  currency: TransactionCurrency;

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  amount: number;

  @Column({
    type: 'enum',
    enum: TransactionProvider,
    enumName: 'transaction_provider_enum',
  })
  provider: TransactionProvider;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    enumName: 'transaction_status_enum',
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  @Column({ nullable: true, unique: true })
  externalRef: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt: Date;
}
