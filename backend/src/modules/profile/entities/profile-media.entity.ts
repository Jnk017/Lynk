import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { MediaType } from '../../../common/enums';
import { User } from '../../user/entities/user.entity';

@Entity('profile_media')
export class ProfileMedia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.media, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'enum', enum: MediaType })
  type: MediaType;

  @Column()
  url: string;

  @Column({ nullable: true })
  thumbnailUrl: string;

  @Column({ default: 0 })
  orderIndex: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isModerated: boolean;

  @Column({ default: false })
  isFlagged: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
