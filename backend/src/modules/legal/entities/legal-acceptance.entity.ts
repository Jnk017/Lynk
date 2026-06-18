import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AppChannel } from '../../../common/enums';

@Entity('legal_acceptances')
@Index(['userId', 'documentType', 'documentVersion'])
export class LegalAcceptance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  @Index()
  userId: string;

  @Column({ length: 50 })
  documentType: string;

  @Column({ length: 20 })
  documentVersion: string;

  @Column({ length: 5 })
  language: string;

  @CreateDateColumn()
  acceptedAt: Date;

  @Column({ nullable: true })
  ipAddress: string;

  @Column({ type: 'text', nullable: true })
  userAgent: string;

  @Column({ type: 'timestamp', nullable: true })
  revokedAt: Date;

  @Column({
    type: 'enum',
    enum: AppChannel,
    enumName: 'app_channel_enum',
    default: AppChannel.GLOBAL,
  })
  @Index()
  channel?: AppChannel;

  @DeleteDateColumn({ nullable: true })
  deletedAt: Date;
}
