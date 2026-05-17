import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { SwipeAction } from '../../../common/enums';
import { User } from '../../user/entities/user.entity';

@Entity('swipe_actions')
@Index(['swiperId', 'swipedId'], { unique: true })
export class SwipeActionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  swiperId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'swiper_id' })
  swiper: User;

  @Column()
  @Index()
  swipedId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'swiped_id' })
  swiped: User;

  @Column({ type: 'enum', enum: SwipeAction })
  action: SwipeAction;

  @CreateDateColumn()
  createdAt: Date;
}
