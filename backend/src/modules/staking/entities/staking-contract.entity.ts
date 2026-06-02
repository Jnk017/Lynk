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
import { StakingContractStatus } from '../../../common/enums';
import { User } from '../../user/entities/user.entity';

/**
 * Anti-Ghosting Smart Contract: both users stake Pi for an IRL date.
 * - If both show up (geolocation validated within 500m), both stakes are returned.
 * - If one ghosts, the victim recovers the full stake from both parties.
 */
@Entity('staking_contracts')
export class StakingContract {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  creatorId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'creatorId' })
  creator: User;

  @Column()
  partnerId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'partnerId' })
  partner: User;

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  stakeAmountPiEach: number;

  @Column({
    type: 'enum',
    enum: StakingContractStatus,
    enumName: 'staking_contract_status_enum',
    default: StakingContractStatus.ACTIVE,
  })
  status: StakingContractStatus;

  @Column({ nullable: true })
  dateScheduledAt: Date;

  @Column({ nullable: true })
  dateLocation: string;

  @Column({ default: false })
  creatorConfirmed: boolean;

  @Column({ default: false })
  partnerConfirmed: boolean;

  @Column({ nullable: true })
  creatorConfirmedAt: Date;

  @Column({ nullable: true })
  partnerConfirmedAt: Date;

  @Column({ nullable: true })
  resolvedAt: Date;

  @Column({ nullable: true })
  victimId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt: Date;
}
