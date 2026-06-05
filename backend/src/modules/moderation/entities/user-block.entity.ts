import {
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  Column,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('user_blocks')
@Unique(['blockerId', 'blockedUserId'])
@Index(['blockerId'])
@Index(['blockedUserId'])
export class UserBlock {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  blockerId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'blockerId' })
  blocker: User;

  @Column()
  blockedUserId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'blockedUserId' })
  blockedUser: User;

  @CreateDateColumn()
  createdAt: Date;
}
