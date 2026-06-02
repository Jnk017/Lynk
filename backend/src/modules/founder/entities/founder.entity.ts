import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('founders')
@Index(['userId'], { unique: true })
@Index(['founderNumber'], { unique: true })
export class Founder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  userId: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ unique: true })
  founderNumber: number;

  @Column({ default: true })
  lifetimePremium: boolean;

  @Column({ default: false })
  revenueSharingEligible: boolean;

  @Column({ nullable: true })
  revenueSharingActivatedAt: Date;

  @Column({ type: 'jsonb', default: '{}' })
  metadata: Record<string, unknown>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt: Date;
}
