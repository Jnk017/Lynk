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
import { MatchmakingSessionStatus } from '../../../common/enums';
import { User } from '../../user/entities/user.entity';

/**
 * AI Matchmaker session (Platinum only): quarterly session where the AI
 * proposes 3 high-compatibility profiles. User eliminates 1 after discussion,
 * then makes a final choice from the remaining 2.
 */
@Entity('matchmaking_sessions')
export class MatchmakingSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'enum',
    enum: MatchmakingSessionStatus,
    default: MatchmakingSessionStatus.PENDING,
  })
  status: MatchmakingSessionStatus;

  @Column({ nullable: true })
  profile1Id: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'profile_1_id' })
  profile1: User;

  @Column({ nullable: true })
  profile2Id: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'profile_2_id' })
  profile2: User;

  @Column({ nullable: true })
  profile3Id: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'profile_3_id' })
  profile3: User;

  @Column({ nullable: true })
  droppedProfileId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'dropped_profile_id' })
  droppedProfile: User;

  @Column({ nullable: true })
  finalChoiceId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'final_choice_id' })
  finalChoice: User;

  @Column({ nullable: true })
  quarterPeriod: string;

  @CreateDateColumn()
  startedAt: Date;

  @Column({ nullable: true })
  completedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt: Date;
}
