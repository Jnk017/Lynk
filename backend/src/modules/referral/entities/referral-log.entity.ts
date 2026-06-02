import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ReferralStatus } from '../../../common/enums';
import { User } from '../../user/entities/user.entity';

@Entity('referral_logs')
export class ReferralLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  referrerId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'referrer_id' })
  referrer: User;

  @Column()
  refereeId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'referee_id' })
  referee: User;

  @Column({
    type: 'enum',
    enum: ReferralStatus,
    default: ReferralStatus.PENDING,
  })
  status: ReferralStatus;

  @Column({ default: false })
  verificationPassed: boolean;

  @Column({ type: 'decimal', precision: 18, scale: 8, default: 0 })
  rewardAmountPi: number;

  /**
   * This referral counts toward activating revenue sharing for the referrer
   * (i.e., the referee has completed AI verification).
   */
  @Column({ default: false })
  countsForRevenueSharing: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt: Date;
}
