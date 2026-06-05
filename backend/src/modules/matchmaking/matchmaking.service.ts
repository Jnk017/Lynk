import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { User } from '../user/entities/user.entity';
import { SwipeActionEntity } from './entities/swipe-action.entity';
import { Match } from './entities/match.entity';
import { MatchmakingSession } from './entities/matchmaking-session.entity';
import { NotificationService } from '../notification/notification.service';
import {
  SwipeAction,
  MatchStatus,
  MatchmakingSessionStatus,
  SubscriptionTier,
  NotificationType,
} from '../../common/enums';
import { SUBSCRIPTION_LIMITS, REDIS_KEYS } from '../../common/constants';
import { ModerationService } from '../moderation/moderation.service';

@Injectable()
export class MatchmakingService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(SwipeActionEntity)
    private swipeRepository: Repository<SwipeActionEntity>,
    @InjectRepository(Match)
    private matchRepository: Repository<Match>,
    @InjectRepository(MatchmakingSession)
    private sessionRepository: Repository<MatchmakingSession>,
    private notificationService: NotificationService,
    private moderationService: ModerationService,
    private dataSource: DataSource,
    @InjectRedis() private redisClient: Redis,
  ) {}

  async swipe(
    swiperId: string,
    swipedId: string,
    action: SwipeAction,
  ): Promise<{ matched: boolean; matchId?: string }> {
    await this.moderationService.assertInteractionAllowed(swiperId, swipedId);
    const swiper = await this.userRepository.findOne({
      where: { id: swiperId },
      relations: ['subscriptionPlan'],
    });
    if (!swiper) throw new NotFoundException('User not found');

    // Enforce daily swipe limits for Bronze tier
    const tier = swiper.subscriptionPlan?.name || SubscriptionTier.BRONZE;
    const limits = SUBSCRIPTION_LIMITS[tier];

    if (limits.dailySwipes !== Infinity) {
      const countKey = REDIS_KEYS.DAILY_SWIPES(swiperId);
      const currentCount = parseInt(
        (await this.redisClient.get(countKey)) || '0',
        10,
      );
      if (currentCount >= limits.dailySwipes) {
        throw new ForbiddenException(
          `Daily swipe limit reached (${limits.dailySwipes}). Upgrade to Silver or higher for unlimited swipes.`,
        );
      }
      const ttl = this.secondsUntilMidnight();
      await this.redisClient.set(countKey, currentCount + 1, 'EX', ttl);
    }

    if (action === SwipeAction.SUPER_LIKE && limits.dailySuperLikes > 0) {
      const superKey = `super_likes:${swiperId}`;
      const count = parseInt((await this.redisClient.get(superKey)) || '0', 10);
      if (count >= limits.dailySuperLikes) {
        throw new ForbiddenException(
          `Daily Super Like limit reached (${limits.dailySuperLikes})`,
        );
      }
      const ttl = this.secondsUntilMidnight();
      await this.redisClient.set(superKey, count + 1, 'EX', ttl);
    }

    const existingSwipe = await this.swipeRepository.findOne({
      where: { swiperId, swipedId },
    });
    if (existingSwipe) {
      existingSwipe.action = action;
      await this.swipeRepository.save(existingSwipe);
    } else {
      await this.swipeRepository.save({ swiperId, swipedId, action });
    }

    if (action === SwipeAction.DISLIKE) {
      return { matched: false };
    }

    // Check if the other user already liked the swiper
    const reverseSwipe = await this.swipeRepository.findOne({
      where: {
        swiperId: swipedId,
        swipedId: swiperId,
        action: In([SwipeAction.LIKE, SwipeAction.SUPER_LIKE]),
      },
    });

    if (reverseSwipe) {
      const existingMatch = await this.matchRepository.findOne({
        where: [
          { initiatorId: swiperId, receiverId: swipedId },
          { initiatorId: swipedId, receiverId: swiperId },
        ],
      });

      if (!existingMatch) {
        const bumbleMode = swiper.preferences?.bumbleMode || false;
        const match = await this.matchRepository.save({
          initiatorId: swiperId,
          receiverId: swipedId,
          status: MatchStatus.MATCHED,
          bumbleMode,
        });

        // Notify both users
        await this.notificationService.sendToUser(swipedId, {
          type: NotificationType.MATCH,
          title: "It's a Match! 🎉",
          body: `You and ${swiper.displayName} liked each other!`,
          data: { matchId: match.id },
        });

        return { matched: true, matchId: match.id };
      }
    }

    // Notify of Like (not a match yet) if action is super_like
    if (action === SwipeAction.SUPER_LIKE) {
      await this.notificationService.sendToUser(swipedId, {
        type: NotificationType.SUPER_LIKE,
        title: '⭐ Super Like!',
        body: `${swiper.displayName} sent you a Super Like!`,
        data: { userId: swiperId },
      });
    }

    return { matched: false };
  }

  async getDiscoveryFeed(
    userId: string,
    page = 1,
    limit = 10,
  ): Promise<User[]> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const alreadySwiped = await this.swipeRepository
      .createQueryBuilder('s')
      .select('s.swipedId')
      .where('s.swiperId = :userId', { userId })
      .getRawMany();

    const blockedIds = await this.moderationService.blockedUserIdsFor(userId);
    const excludeIds = [
      userId,
      ...blockedIds,
      ...alreadySwiped.map((s: { s_swipedId: string }) => s.s_swipedId),
    ];

    const query = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.media', 'media')
      .where('user.id NOT IN (:...excludeIds)', { excludeIds })
      .andWhere('user.isProfileComplete = true')
      .andWhere('user.isBanned = false');

    // Apply user preferences
    if (user.preferences?.genders?.length) {
      query.andWhere('user.gender IN (:...genders)', {
        genders: user.preferences.genders,
      });
    }

    if (user.preferences?.ageMin || user.preferences?.ageMax) {
      const now = new Date();
      if (user.preferences.ageMin) {
        const maxBirthdate = new Date(
          now.getFullYear() - user.preferences.ageMin,
          now.getMonth(),
          now.getDate(),
        );
        query.andWhere('user.birthdate <= :maxBirthdate', { maxBirthdate });
      }
      if (user.preferences.ageMax) {
        const minBirthdate = new Date(
          now.getFullYear() - user.preferences.ageMax,
          now.getMonth(),
          now.getDate(),
        );
        query.andWhere('user.birthdate >= :minBirthdate', { minBirthdate });
      }
    }

    // Prioritize boosted users and verified users in the feed
    query
      .orderBy('user.trustScore', 'DESC')
      .addOrderBy('user.createdAt', 'DESC');

    return query
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();
  }

  /**
   * Launch an AI Matchmaker session for Platinum subscribers.
   * Queries 3 high-compatibility profiles and creates the session.
   */
  async startMatchmakingSession(userId: string): Promise<MatchmakingSession> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['subscriptionPlan'],
    });

    if (!user?.subscriptionPlan?.hasSmartMatchmaking) {
      throw new ForbiddenException(
        'AI Matchmaker is a Platinum exclusive feature',
      );
    }

    // Ensure only one active session per quarter
    const currentQuarter = this.getCurrentQuarter();
    const existingSession = await this.sessionRepository.findOne({
      where: { userId, quarterPeriod: currentQuarter },
    });

    if (existingSession) {
      throw new BadRequestException(
        `You have already used your AI Matchmaker session for ${currentQuarter}`,
      );
    }

    const candidates = await this.userRepository
      .createQueryBuilder('user')
      .where('user.id != :userId', { userId })
      .andWhere('user.isProfileComplete = true')
      .andWhere('user.isBanned = false')
      .andWhere('user.verificationStatus = :status', { status: 'verified' })
      .orderBy('user.trustScore', 'DESC')
      .take(3)
      .getMany();

    if (candidates.length < 3) {
      throw new BadRequestException(
        'Not enough verified profiles available for AI Matchmaker',
      );
    }

    const session = await this.sessionRepository.save({
      userId,
      profile1Id: candidates[0].id,
      profile2Id: candidates[1].id,
      profile3Id: candidates[2].id,
      status: MatchmakingSessionStatus.IN_PROGRESS,
      quarterPeriod: currentQuarter,
    });

    return this.sessionRepository.findOne({
      where: { id: session.id },
      relations: ['profile1', 'profile2', 'profile3'],
    });
  }

  async dropSessionProfile(
    userId: string,
    sessionId: string,
    profileId: string,
  ): Promise<MatchmakingSession> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId, userId },
    });

    if (!session) throw new NotFoundException('Session not found');
    if (session.status !== MatchmakingSessionStatus.IN_PROGRESS) {
      throw new BadRequestException('Session is not in progress');
    }
    if (
      ![session.profile1Id, session.profile2Id, session.profile3Id].includes(
        profileId,
      )
    ) {
      throw new BadRequestException('Profile does not belong to this session');
    }

    session.droppedProfileId = profileId;
    session.status = MatchmakingSessionStatus.AWAITING_CHOICE;

    return this.sessionRepository.save(session);
  }

  async makeFinalChoice(
    userId: string,
    sessionId: string,
    finalProfileId: string,
  ): Promise<Match> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId, userId },
    });

    if (!session) throw new NotFoundException('Session not found');
    if (session.status !== MatchmakingSessionStatus.AWAITING_CHOICE) {
      throw new BadRequestException('Session is not awaiting final choice');
    }

    const remainingProfiles = [
      session.profile1Id,
      session.profile2Id,
      session.profile3Id,
    ].filter((id) => id !== session.droppedProfileId);

    if (!remainingProfiles.includes(finalProfileId)) {
      throw new BadRequestException('Invalid final choice');
    }

    session.finalChoiceId = finalProfileId;
    session.status = MatchmakingSessionStatus.COMPLETED;
    session.completedAt = new Date();
    await this.sessionRepository.save(session);

    const match = await this.matchRepository.save({
      initiatorId: userId,
      receiverId: finalProfileId,
      status: MatchStatus.MATCHED,
    });

    return match;
  }

  private secondsUntilMidnight(): number {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    return Math.floor((midnight.getTime() - now.getTime()) / 1000);
  }

  private getCurrentQuarter(): string {
    const now = new Date();
    const quarter = Math.ceil((now.getMonth() + 1) / 3);
    return `${now.getFullYear()}-Q${quarter}`;
  }
}
