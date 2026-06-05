import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { TRUST_SCORE_VERIFICATION_BONUS } from '../../common/constants';
import { VerificationStatus } from '../../common/enums';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['media', 'prompts', 'subscriptionPlan'],
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<User> {
    const user = await this.findById(userId);

    Object.assign(user, dto);

    const hasMedia = user.media?.length > 0;
    const hasBio = !!user.bio;
    const hasPrompts = user.prompts?.length > 0;
    user.isProfileComplete = hasMedia && hasBio && hasPrompts;

    return this.userRepository.save(user);
  }

  async setOnlineStatus(userId: string, isOnline: boolean): Promise<void> {
    await this.userRepository.update(userId, {
      isOnline,
      lastSeen: isOnline ? undefined : new Date(),
    });
  }

  async updateFcmToken(userId: string, fcmToken: string): Promise<void> {
    await this.userRepository.update(userId, { fcmToken });
  }

  /**
   * Called after AI liveness verification succeeds.
   * Applies a trust score bonus and updates verification status.
   */
  async markVerified(userId: string): Promise<User> {
    const user = await this.findById(userId);
    user.verificationStatus = VerificationStatus.VERIFIED;
    user.trustScore = Math.min(
      100,
      Number(user.trustScore) + TRUST_SCORE_VERIFICATION_BONUS,
    );
    return this.userRepository.save(user);
  }

  async rejectVerification(userId: string): Promise<User> {
    const user = await this.findById(userId);
    user.verificationStatus = VerificationStatus.REJECTED;
    return this.userRepository.save(user);
  }

  async getPublicProfile(
    _viewerId: string,
    targetUserId: string,
  ): Promise<Partial<User>> {
    const user = await this.userRepository.findOne({
      where: { id: targetUserId },
      relations: ['media', 'prompts', 'subscriptionPlan'],
    });
    if (!user) throw new NotFoundException('User not found');

    return {
      id: user.id,
      displayName: user.displayName,
      bio: user.bio,
      birthdate: user.birthdate,
      gender: user.gender,
      lifestyleTags: user.lifestyleTags,
      location: user.location,
      verificationStatus: user.verificationStatus,
      trustScore: user.trustScore,
      subscriptionPlan: user.subscriptionPlan,
      isOnline: user.isOnline,
      lastSeen: user.lastSeen,
      isProfileComplete: user.isProfileComplete,
      media: user.media,
      prompts: user.prompts,
      isFounder: user.isFounder,
      founderRank: user.founderRank,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async markVerificationPending(userId: string): Promise<void> {
    await this.userRepository.update(userId, {
      verificationStatus: VerificationStatus.PENDING,
    });
  }

  async updateVerificationDocuments(
    userId: string,
    fields: Pick<User, 'livenessVideoUrl'> | Pick<User, 'kycDocumentUrl'>,
  ): Promise<void> {
    await this.userRepository.update(userId, fields);
  }

  async searchUsers(query: string, limit = 20): Promise<User[]> {
    return this.userRepository
      .createQueryBuilder('user')
      .where('user.displayName ILIKE :query', { query: `%${query}%` })
      .andWhere('user.isBanned = false')
      .andWhere('user.isProfileComplete = true')
      .limit(limit)
      .getMany();
  }
}
