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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt: Date;
}

@Entity('gifts_sent')
export class GiftSent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  senderId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'senderId' })
  sender: User;

  @Column()
  receiverId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'receiverId' })
  receiver: User;

  @Column()
  giftCatalogId: string;

  @ManyToOne(() => GiftCatalogItem)
  @JoinColumn({ name: 'giftCatalogId' })
  gift: GiftCatalogItem;

  @Column({
    type: 'enum',
    enum: TransactionCurrency,
    enumName: 'transaction_currency_enum',
  })
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
