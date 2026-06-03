import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { RevenuePoolStatus } from '../../../common/enums';
import { RevenueDistribution } from './revenue-distribution.entity';

/**
 * Monthly revenue pool: 5% of global revenue (subscriptions, boosts, gifts)
 * distributed equally among all Founders with active revenue sharing.
 */
@Entity('revenue_pools')
@Index(['period'], { unique: true })
@Index(['idempotencyKey'], { unique: true })
export class RevenuePool {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Format: "2025-01" */
  @Column({ unique: true })
  period: string;

  @Column({ unique: true })
  idempotencyKey: string;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  totalRevenue: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  distributableAmount: number;

  @Column({ default: 0 })
  activeFounderCount: number;

  @Column({ type: 'decimal', precision: 18, scale: 8, default: 0 })
  dividendPerFounder: number;

  @Column({
    type: 'enum',
    enum: RevenuePoolStatus,
    enumName: 'revenue_pool_status_enum',
    default: RevenuePoolStatus.CALCULATING,
  })
  status: RevenuePoolStatus;

  @OneToMany(() => RevenueDistribution, (dist) => dist.pool)
  distributions: RevenueDistribution[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt: Date;
}
