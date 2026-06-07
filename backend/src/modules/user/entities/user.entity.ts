import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { VerificationStatus, Gender, UserRole } from '../../../common/enums';
import { SubscriptionPlan } from '../../subscription/entities/subscription-plan.entity';
import { ProfileMedia } from '../../profile/entities/profile-media.entity';
import { UserPrompt } from '../../profile/entities/user-prompt.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: true })
  @Index()
  phone: string;

  @Column({ unique: true, nullable: true })
  @Index()
  email: string;

  @Column({ nullable: true })
  passwordHash: string;

  @Column({ unique: true, nullable: true })
  @Index()
  piWalletAddress: string;

  @Column({ nullable: true })
  googleId: string;

  @Column({ nullable: true })
  appleId: string;

  @Column({ unique: true })
  @Index()
  referralCode: string;

  @Column({ nullable: true })
  referredById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'referredById' })
  referredBy: User;

  @Column({ default: 0 })
  successfulReferralsCount: number;

  @Column({ default: false })
  @Index()
  isFounder: boolean;

  @Column({ nullable: true, unique: true })
  founderRank: number;

  @Column({ default: false })
  isRevenueSharingActive: boolean;

  @Column({ nullable: true })
  revenueSharingJoinedAt: Date;

  @Column({ nullable: true })
  displayName: string;

  @Column({ nullable: true, length: 500 })
  bio: string;

  @Column({ nullable: true })
  birthdate: Date;

  @Column({
    type: 'enum',
    enum: Gender,
    enumName: 'gender_enum',
    nullable: true,
  })
  gender: Gender;

  @Column({ type: 'jsonb', default: '[]' })
  lifestyleTags: Record<string, unknown>[];

  @Column({ type: 'jsonb', nullable: true })
  location: { lat: number; lng: number; city?: string; country?: string };

  @Column({
    type: 'enum',
    enum: VerificationStatus,
    enumName: 'verification_status_enum',
    default: VerificationStatus.NONE,
  })
  verificationStatus: VerificationStatus;

  @Column({ nullable: true })
  livenessVideoUrl: string;

  @Column({ nullable: true })
  kycDocumentUrl: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  trustScore: number;

  @Column({ nullable: true })
  subscriptionPlanId: string;

  @ManyToOne(() => SubscriptionPlan, { nullable: true, eager: true })
  @JoinColumn({ name: 'subscriptionPlanId' })
  subscriptionPlan: SubscriptionPlan;

  @Column({ nullable: true })
  subscriptionExpiresAt: Date;

  @Column({ type: 'decimal', precision: 18, scale: 8, default: 0 })
  piBalance: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  fiatBalance: number;

  @Column({ default: false })
  isOnline: boolean;

  @Column({ nullable: true })
  lastSeen: Date;

  @Column({ default: false })
  isProfileComplete: boolean;

  @Column({ nullable: true })
  spotifyConnected: string;

  @Column({ nullable: true })
  instagramConnected: string;

  @Column({ default: false })
  blockContacts: boolean;

  @Column({
    type: 'enum',
    enum: UserRole,
    enumName: 'user_role_enum',
    default: UserRole.USER,
  })
  @Index()
  role: UserRole;

  @Column({ default: false })
  isBanned: boolean;

  @Column({ nullable: true })
  bannedAt: Date;

  @Column({ nullable: true })
  banReason: string;

  @Column({ nullable: true })
  fcmToken: string;

  @Column({ type: 'jsonb', default: '{}' })
  preferences: {
    ageMin?: number;
    ageMax?: number;
    distanceKm?: number;
    genders?: string[];
    bumbleMode?: boolean;
  };

  @OneToMany(() => ProfileMedia, (media) => media.user)
  media: ProfileMedia[];

  @OneToMany(() => UserPrompt, (prompt) => prompt.user)
  prompts: UserPrompt[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deletionRequestedAt?: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  deletionScheduledFor?: Date | null;

  @DeleteDateColumn({ nullable: true })
  deletedAt: Date;
}
