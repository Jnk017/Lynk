import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { ChatService } from './chat.service';
import { ChatRoom } from './entities/chat-room.entity';
import { ChatParticipant } from './entities/chat-participant.entity';
import { Message } from './entities/message.entity';
import { Match } from '../matchmaking/entities/match.entity';
import { AiService } from '../ai/ai.service';
import { NotificationService } from '../notification/notification.service';
import { MessageType } from '../../common/enums';
import { ObservabilityService } from '../observability/observability.service';
import { ModerationService } from '../moderation/moderation.service';

interface RepositoryMock<T extends object> {
  findOne: jest.Mock<Promise<T | null>, [unknown]>;
  find: jest.Mock<Promise<T[]>, [unknown?]>;
  save: jest.Mock<Promise<T>, [unknown]>;
  update: jest.Mock<Promise<unknown>, [unknown, unknown]>;
}

function createRepositoryMock<T extends object>(): RepositoryMock<T> {
  return {
    findOne: jest.fn<Promise<T | null>, [unknown]>().mockResolvedValue(null),
    find: jest.fn<Promise<T[]>, [unknown?]>().mockResolvedValue([]),
    save: jest
      .fn<Promise<T>, [unknown]>()
      .mockImplementation((input) =>
        Promise.resolve({ id: 'saved-id', ...(input as object) } as T),
      ),
    update: jest
      .fn<Promise<unknown>, [unknown, unknown]>()
      .mockResolvedValue({ affected: 1 }),
  };
}

function createService() {
  const chatRoomRepository = createRepositoryMock<ChatRoom>();
  const participantRepository = createRepositoryMock<ChatParticipant>();
  const messageRepository = createRepositoryMock<Message>();
  const matchRepository = createRepositoryMock<Match>();
  const aiService = {
    moderateContent: jest
      .fn<Promise<boolean>, [string]>()
      .mockResolvedValue(false),
    generateIceBreakers: jest.fn(),
  };
  const notificationService = {
    sendToUser: jest.fn<Promise<void>, [string, unknown]>().mockResolvedValue(),
  };
  const moderationService = {
    assertInteractionAllowed: jest.fn().mockResolvedValue(undefined),
    blockedUserIdsFor: jest.fn().mockResolvedValue([]),
  };
  const observabilityService = {
    track: jest
      .fn<Promise<void>, [unknown, string, Record<string, unknown>?]>()
      .mockResolvedValue(),
  };

  const service = new ChatService(
    chatRoomRepository as unknown as Repository<ChatRoom>,
    participantRepository as unknown as Repository<ChatParticipant>,
    messageRepository as unknown as Repository<Message>,
    matchRepository as unknown as Repository<Match>,
    aiService as unknown as AiService,
    notificationService as unknown as NotificationService,
    moderationService as unknown as ModerationService,
    observabilityService as unknown as ObservabilityService,
  );

  return {
    service,
    chatRoomRepository,
    participantRepository,
    messageRepository,
    matchRepository,
    aiService,
    notificationService,
    moderationService,
    observabilityService,
  };
}

describe('ChatService security and validation', () => {
  it('rejects room creation when the user is not part of the match', async () => {
    const { service, matchRepository, chatRoomRepository } = createService();
    matchRepository.findOne.mockResolvedValueOnce({
      id: 'match-1',
      initiatorId: 'user-a',
      receiverId: 'user-b',
    } as Match);

    await expect(
      service.getOrCreateRoomForMatch('attacker', 'match-1'),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(chatRoomRepository.save).not.toHaveBeenCalled();
  });

  it('returns not found when the match does not exist', async () => {
    const { service } = createService();

    await expect(
      service.getOrCreateRoomForMatch('user-a', 'missing-match'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects toxic text messages before persisting or notifying', async () => {
    const {
      service,
      participantRepository,
      aiService,
      messageRepository,
      notificationService,
    } = createService();
    participantRepository.findOne.mockResolvedValueOnce({
      userId: 'user-a',
      chatRoomId: 'room-1',
    } as ChatParticipant);
    aiService.moderateContent.mockResolvedValueOnce(true);

    await expect(
      service.sendMessage('user-a', 'room-1', 'toxic text', MessageType.TEXT),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(messageRepository.save).not.toHaveBeenCalled();
    expect(notificationService.sendToUser).not.toHaveBeenCalled();
  });

  it('persists valid messages, notifies other participants and tracks message_sent', async () => {
    const {
      service,
      participantRepository,
      messageRepository,
      notificationService,
      observabilityService,
    } = createService();
    participantRepository.findOne.mockResolvedValueOnce({
      userId: 'user-a',
      chatRoomId: 'room-1',
    } as ChatParticipant);
    participantRepository.find.mockResolvedValueOnce([
      { userId: 'user-a', chatRoomId: 'room-1' } as ChatParticipant,
      { userId: 'user-b', chatRoomId: 'room-1' } as ChatParticipant,
    ]);
    messageRepository.save.mockResolvedValueOnce({
      id: 'message-1',
      chatRoomId: 'room-1',
      senderId: 'user-a',
      content: 'hello',
      type: MessageType.TEXT,
    } as Message);

    const message = await service.sendMessage(
      'user-a',
      'room-1',
      'hello',
      MessageType.TEXT,
    );

    expect(message.id).toBe('message-1');
    expect(notificationService.sendToUser).toHaveBeenCalledWith(
      'user-b',
      expect.objectContaining({ body: 'hello' }),
    );
    expect(observabilityService.track).toHaveBeenCalledWith(
      'message_sent',
      'user-a',
      expect.objectContaining({ chatRoomId: 'room-1', messageId: 'message-1' }),
    );
  });
});
