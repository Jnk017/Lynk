import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { TransactionCurrency } from '../../../common/enums';
import { User } from '../../user/entities/user.entity';

@Entity('gift_catalog')
export class GiftCatalogItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  emoji: string;

  @Column({ nullable: true })
  animationUrl: string;

  @Column({ type: 'decimal', precision: 10, scale: 4 })
  pricePi: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  priceUsd: number;

  @Column({ default: false })
  isFullScreen: boolean;

  @Column({ default: 0 })
  trustScoreBonus: number;

  @Column({ default: true })
  isActive: boolean;
}

@Entity('gifts_sent')
export class GiftSent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  senderId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @Column()
  receiverId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'receiver_id' })
  receiver: User;

  @Column()
  giftCatalogId: string;

  @ManyToOne(() => GiftCatalogItem)
  @JoinColumn({ name: 'gift_catalog_id' })
  gift: GiftCatalogItem;

  @Column({ type: 'enum', enum: TransactionCurrency })
  paidCurrency: TransactionCurrency;

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  paidAmount: number;

  @Column({ nullable: true })
  message: string;

  @CreateDateColumn()
  sentAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt: Date;
}
