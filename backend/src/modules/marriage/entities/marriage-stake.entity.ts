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
import { MarriageStakeStatus } from '../../../common/enums';
import { User } from '../../user/entities/user.entity';

/**
 * Marriage Stake: couples stake ~$500 equivalent in Pi.
 * Upon proof of marriage (certificate + photo with unique code), the stake is
 * released plus a loyalty bonus. Requires Gold/Platinum subscription.
 */
@Entity('marriage_stakes')
export class MarriageStake {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user1Id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user1Id' })
  user1: User;

  @Column()
  user2Id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user2Id' })
  user2: User;

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  amountPi: number;

  @Column({
    type: 'enum',
    enum: MarriageStakeStatus,
    enumName: 'marriage_stake_status_enum',
    default: MarriageStakeStatus.PENDING,
  })
  status: MarriageStakeStatus;

  @Column({ nullable: true })
  marriageProofUrl: string;

  @Column({ nullable: true })
  marriagePhotoUrl: string;

  /** Unique verification code embedded in proof photo */
  @Column({ nullable: true })
  verificationCode: string;

  @Column({ nullable: true })
  verifiedAt: Date;

  @Column({ nullable: true })
  releasedAt: Date;

  /** Loyalty bonus distributed upon successful release */
  @Column({ type: 'decimal', precision: 18, scale: 8, default: 0 })
  loyaltyBonusPi: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt: Date;
}
