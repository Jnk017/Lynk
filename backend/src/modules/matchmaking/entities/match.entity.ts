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
import { MatchStatus } from '../../../common/enums';
import { User } from '../../user/entities/user.entity';

@Entity('matches')
export class Match {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  initiatorId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'initiatorId' })
  initiator: User;

  @Column()
  @Index()
  receiverId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'receiverId' })
  receiver: User;

  @Column({
    type: 'enum',
    enum: MatchStatus,
    enumName: 'match_status_enum',
    default: MatchStatus.MATCHED,
  })
  status: MatchStatus;

  /**
   * In Bumble mode, only the receiver (woman) can initiate the first message.
   * This flag tracks if the conversation has been unlocked.
   */
  @Column({ default: false })
  bumbleMode: boolean;

  @Column({ default: false })
  firstMessageSent: boolean;

  @Column({ nullable: true })
  unmatchedAt: Date;

  @Column({ nullable: true })
  unmatchedById: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt: Date;
}
