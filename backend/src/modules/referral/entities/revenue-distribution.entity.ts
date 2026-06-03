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
import { RevenueDistributionStatus } from '../../../common/enums';
import { User } from '../../user/entities/user.entity';
import { RevenuePool } from './revenue-pool.entity';

@Entity('revenue_distributions')
@Index(['month'])
@Index(['poolId', 'founderId'], { unique: true })
@Index(['month', 'founderId'], { unique: true })
export class RevenueDistribution {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  poolId: string;

  @ManyToOne(() => RevenuePool, (pool) => pool.distributions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'poolId' })
  pool: RevenuePool;

  @Column()
  founderId: string;

  @Column()
  month: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'founderId' })
  founder: User;

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  amount: number;

  @Column({
    type: 'enum',
    enum: RevenueDistributionStatus,
    enumName: 'revenue_distribution_status_enum',
    default: RevenueDistributionStatus.PENDING,
  })
  status: RevenueDistributionStatus;

  @Column({ nullable: true })
  paidAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt: Date;
}
