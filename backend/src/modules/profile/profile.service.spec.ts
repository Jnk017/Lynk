import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ProfileService } from './profile.service';
import { ProfileMedia } from './entities/profile-media.entity';
import { UserPrompt } from './entities/user-prompt.entity';
import { S3Service } from '../s3/s3.service';
import { AiService } from '../ai/ai.service';
import { MediaType } from '../../common/enums';

interface RepositoryMock<T extends object> {
  find: jest.Mock<Promise<T[]>, [unknown?]>;
  findOne: jest.Mock<Promise<T | null>, [unknown]>;
  count: jest.Mock<Promise<number>, [unknown?]>;
  save: jest.Mock<Promise<T>, [unknown]>;
  remove: jest.Mock<Promise<T>, [T]>;
  update: jest.Mock<Promise<unknown>, [unknown, unknown]>;
}

function createRepositoryMock<T extends object>(): RepositoryMock<T> {
  return {
    find: jest.fn<Promise<T[]>, [unknown?]>().mockResolvedValue([]),
    findOne: jest.fn<Promise<T | null>, [unknown]>().mockResolvedValue(null),
    count: jest.fn<Promise<number>, [unknown?]>().mockResolvedValue(0),
    save: jest
      .fn<Promise<T>, [unknown]>()
      .mockImplementation((input) =>
        Promise.resolve({ id: 'saved-id', ...(input as object) } as T),
      ),
    remove: jest
      .fn<Promise<T>, [T]>()
      .mockImplementation((input) => Promise.resolve(input)),
    update: jest
      .fn<Promise<unknown>, [unknown, unknown]>()
      .mockResolvedValue({ affected: 1 }),
  };
}

function createService() {
  const mediaRepository = createRepositoryMock<ProfileMedia>();
  const promptRepository = createRepositoryMock<UserPrompt>();
  const s3Service = {
    uploadBuffer: jest
      .fn<Promise<string>, [Buffer, string, string]>()
      .mockResolvedValue('https://cdn.test/file.jpg'),
    extractKeyFromUrl: jest
      .fn<string, [string]>()
      .mockReturnValue('profiles/user-1/photos/file.jpg'),
    delete: jest.fn<Promise<void>, [string]>().mockResolvedValue(),
  };
  const aiService = {
    suggestPromptQuestions: jest
      .fn<string[], []>()
      .mockReturnValue(['Prompt?']),
    generateBioSuggestion: jest
      .fn<Promise<string>, [string]>()
      .mockResolvedValue('Generated bio'),
  };
  const service = new ProfileService(
    mediaRepository as unknown as Repository<ProfileMedia>,
    promptRepository as unknown as Repository<UserPrompt>,
    s3Service as unknown as S3Service,
    aiService as unknown as AiService,
  );

  return { service, mediaRepository, promptRepository, s3Service, aiService };
}

function createFile(name = 'photo.jpg'): Express.Multer.File {
  return {
    originalname: name,
    mimetype: 'image/jpeg',
    buffer: Buffer.from('file'),
  } as Express.Multer.File;
}

describe('ProfileService media and prompt validation', () => {
  it('uploads media through S3 and stores only the generated URL metadata', async () => {
    const { service, mediaRepository, s3Service } = createService();

    const media = await service.uploadMedia(
      'user-1',
      createFile(),
      MediaType.PHOTO,
    );

    expect(media.id).toBe('saved-id');
    expect(s3Service.uploadBuffer).toHaveBeenCalledWith(
      expect.any(Buffer),
      expect.stringContaining('profiles/user-1/photos/'),
      'image/jpeg',
    );
    expect(mediaRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        type: MediaType.PHOTO,
        url: 'https://cdn.test/file.jpg',
        orderIndex: 0,
      }),
    );
  });

  it('enforces the maximum active photo limit', async () => {
    const { service, mediaRepository, s3Service } = createService();
    mediaRepository.find.mockResolvedValueOnce(
      Array.from(
        { length: 6 },
        (_, index) => ({ id: `photo-${index}` }) as ProfileMedia,
      ),
    );

    await expect(
      service.uploadMedia('user-1', createFile(), MediaType.PHOTO),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(s3Service.uploadBuffer).not.toHaveBeenCalled();
  });

  it('rejects deleting media that does not belong to the user', async () => {
    const { service, s3Service } = createService();

    await expect(
      service.deleteMedia('user-1', 'media-1'),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(s3Service.delete).not.toHaveBeenCalled();
  });

  it('limits prompts to three answers per user', async () => {
    const { service, promptRepository } = createService();
    promptRepository.count.mockResolvedValueOnce(3);

    await expect(
      service.addPrompt('user-1', 'Question?', 'Answer'),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(promptRepository.save).not.toHaveBeenCalled();
  });
});
