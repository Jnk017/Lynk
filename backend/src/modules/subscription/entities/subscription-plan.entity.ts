import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SubscriptionTier } from '../../../common/enums';

@Entity('subscription_plans')
export class SubscriptionPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: SubscriptionTier, unique: true })
  name: SubscriptionTier;

  @Column()
  displayName: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  priceMonthly: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, default: 0 })
  pricePi: number;

  @Column({ type: 'jsonb', default: '[]' })
  features: string[];

  @Column()
  tierColor: string;

  @Column({ default: false })
  hasSmartMatchmaking: boolean;

  @Column({ default: false })
  hasMarriageStaking: boolean;

  @Column({ default: 0 })
  dailySuperLikes: number;

  @Column({ type: 'integer', nullable: true, comment: 'null means unlimited' })
  dailySwipeLimit: number;

  @Column({ default: false })
  canSeeWhoLiked: boolean;

  @Column({ default: false })
  noAds: boolean;

  @Column({ default: false })
  priorityLikes: boolean;

  @Column({ default: false })
  hasConciergerie: boolean;

  @Column({ type: 'jsonb', default: '{}' })
  exclusivePerks: Record<string, unknown>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt: Date;
}
