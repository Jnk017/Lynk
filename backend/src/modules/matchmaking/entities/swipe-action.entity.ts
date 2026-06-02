import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
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
  @JoinColumn({ name: 'swiperId' })
  swiper: User;

  @Column()
  @Index()
  swipedId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'swipedId' })
  swiped: User;

  @Column({ type: 'enum', enum: SwipeAction, enumName: 'swipe_action_enum' })
  action: SwipeAction;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt: Date;
}
