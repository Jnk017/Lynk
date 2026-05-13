import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RevenueDistributionStatus } from '../../../common/enums';
import { User } from '../../user/entities/user.entity';
import { RevenuePool } from './revenue-pool.entity';

@Entity('revenue_distributions')
export class RevenueDistribution {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  poolId: string;

  @ManyToOne(() => RevenuePool, (pool) => pool.distributions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pool_id' })
  pool: RevenuePool;

  @Column()
  founderId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'founder_id' })
  founder: User;

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  amount: number;

  @Column({ type: 'enum', enum: RevenueDistributionStatus, default: RevenueDistributionStatus.PENDING })
  status: RevenueDistributionStatus;

  @Column({ nullable: true })
  paidAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
