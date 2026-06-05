import {
  Injectable,
  Optional,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatRoom } from './entities/chat-room.entity';
import { ChatParticipant } from './entities/chat-participant.entity';
import { Message } from './entities/message.entity';
import { Match } from '../matchmaking/entities/match.entity';
import { AiService } from '../ai/ai.service';
import { NotificationService } from '../notification/notification.service';
import { MessageType, NotificationType } from '../../common/enums';
import { ObservabilityService } from '../observability/observability.service';
import { ObservabilityEventName } from '../observability/observability-events';
import { ModerationService } from '../moderation/moderation.service';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatRoom)
    private chatRoomRepository: Repository<ChatRoom>,
    @InjectRepository(ChatParticipant)
    private participantRepository: Repository<ChatParticipant>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(Match)
    private matchRepository: Repository<Match>,
    private aiService: AiService,
    private notificationService: NotificationService,
    private moderationService: ModerationService,
    @Optional()
    private observabilityService?: ObservabilityService,
  ) {}

  async getOrCreateRoomForMatch(
    userId: string,
    matchId: string,
  ): Promise<ChatRoom> {
    const match = await this.matchRepository.findOne({
      where: { id: matchId },
    });
    if (!match) throw new NotFoundException('Match not found');
    if (match.initiatorId !== userId && match.receiverId !== userId) {
      throw new ForbiddenException('You are not a participant in this match');
    }

    const otherUserId =
      match.initiatorId === userId ? match.receiverId : match.initiatorId;
    await this.moderationService.assertInteractionAllowed(userId, otherUserId);

    const existing = await this.chatRoomRepository.findOne({
      where: { matchId },
    });
    if (existing) return existing;

    const room = await this.chatRoomRepository.save({
      matchId,
      // Messages are currently protected in transit by TLS but are not E2E encrypted.
      isEncrypted: false,
    });

    await this.participantRepository.save([
      { userId: match.initiatorId, chatRoomId: room.id },
      { userId: match.receiverId, chatRoomId: room.id },
    ]);

    return room;
  }

  async getUserRooms(userId: string): Promise<ChatRoom[]> {
    const participantRows = await this.participantRepository.find({
      where: { userId },
    });
    const roomIds = participantRows.map((p) => p.chatRoomId);
    if (!roomIds.length) return [];

    const blockedIds = new Set(
      await this.moderationService.blockedUserIdsFor(userId),
    );
    const rooms = await this.chatRoomRepository
      .createQueryBuilder('room')
      .leftJoinAndSelect('room.participants', 'participants')
      .leftJoinAndSelect('participants.user', 'user')
      .leftJoinAndSelect('user.media', 'media')
      .whereInIds(roomIds)
      .orderBy('room.lastMessageAt', 'DESC')
      .getMany();
    return rooms.filter(
      (room) =>
        !room.participants.some((participant) =>
          blockedIds.has(participant.userId),
        ),
    );
  }

  async sendMessage(
    senderId: string,
    chatRoomId: string,
    content: string,
    type: MessageType = MessageType.TEXT,
    mediaUrl?: string,
    isEphemeral = false,
  ): Promise<Message> {
    await this.assertParticipant(senderId, chatRoomId);
    const participants = await this.participantRepository.find({
      where: { chatRoomId },
    });
    const recipient = participants.find(
      (participant) => participant.userId !== senderId,
    );
    if (recipient)
      await this.moderationService.assertInteractionAllowed(
        senderId,
        recipient.userId,
      );

    /**
     * AI moderation: detect explicit or toxic content before saving.
     * In production, pipe through OpenAI Moderation API.
     */
    if (type === MessageType.TEXT && content) {
      const isToxic = await this.aiService.moderateContent(content);
      if (isToxic) {
        throw new BadRequestException('Message flagged by content moderation');
      }
    }

    const message = await this.messageRepository.save({
      chatRoomId,
      senderId,
      type,
      content,
      mediaUrl,
      isEphemeral,
    });

    void this.observabilityService?.track(
      ObservabilityEventName.MESSAGE_SENT,
      senderId,
      { chatRoomId, messageId: message.id, type },
    );

    const preview =
      type === MessageType.TEXT ? content.substring(0, 60) : `[${type}]`;
    await this.chatRoomRepository.update(chatRoomId, {
      lastMessageAt: new Date(),
      lastMessagePreview: preview,
    });

    // Push notification to all other participants
    const others = participants.filter((p) => p.userId !== senderId);

    for (const p of others) {
      await this.notificationService.sendToUser(p.userId, {
        type: NotificationType.MESSAGE,
        title: 'New message',
        body: preview,
        data: { chatRoomId },
      });
    }

    return message;
  }

  async getMessages(
    userId: string,
    chatRoomId: string,
    page = 1,
    limit = 50,
  ): Promise<Message[]> {
    await this.assertParticipant(userId, chatRoomId);
    const participants = await this.participantRepository.find({
      where: { chatRoomId },
    });
    const other = participants.find(
      (participant) => participant.userId !== userId,
    );
    if (other)
      await this.moderationService.assertInteractionAllowed(
        userId,
        other.userId,
      );

    return this.messageRepository
      .createQueryBuilder('msg')
      .where('msg.chatRoomId = :chatRoomId', { chatRoomId })
      .andWhere('msg.isDeleted = false')
      .orderBy('msg.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();
  }

  async getSuggestedIceBreakers(
    userId: string,
    targetUserId: string,
  ): Promise<string[]> {
    return this.aiService.generateIceBreakers(userId, targetUserId);
  }

  async markRead(userId: string, chatRoomId: string): Promise<void> {
    await this.assertParticipant(userId, chatRoomId);
    await this.participantRepository.update(
      { userId, chatRoomId },
      { lastReadAt: new Date() },
    );
    await this.messageRepository
      .createQueryBuilder()
      .update(Message)
      .set({ isRead: true, readAt: new Date() })
      .where('chatRoomId = :chatRoomId', { chatRoomId })
      .andWhere('senderId != :userId', { userId })
      .andWhere('isRead = false')
      .execute();
  }

  async assertParticipant(userId: string, chatRoomId: string): Promise<void> {
    const participant = await this.participantRepository.findOne({
      where: { userId, chatRoomId },
    });
    if (!participant)
      throw new ForbiddenException('You are not a participant in this chat');
  }
}
