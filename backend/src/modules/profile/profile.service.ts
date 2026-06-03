import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProfileMedia } from './entities/profile-media.entity';
import { UserPrompt } from './entities/user-prompt.entity';
import { S3Service } from '../s3/s3.service';
import { AiService } from '../ai/ai.service';
import { MediaType } from '../../common/enums';

const MAX_PHOTOS = 6;
const MAX_VIDEOS = 2;
const MAX_PROMPTS = 3;

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(ProfileMedia)
    private mediaRepository: Repository<ProfileMedia>,
    @InjectRepository(UserPrompt)
    private promptRepository: Repository<UserPrompt>,
    private s3Service: S3Service,
    private aiService: AiService,
  ) {}

  async uploadMedia(
    userId: string,
    file: Express.Multer.File,
    type: MediaType,
  ): Promise<ProfileMedia> {
    const existing = await this.mediaRepository.find({
      where: { userId, type, isActive: true },
    });
    const limit = type === MediaType.PHOTO ? MAX_PHOTOS : MAX_VIDEOS;

    if (existing.length >= limit) {
      throw new BadRequestException(`Maximum ${limit} ${type}s allowed`);
    }

    const ext = file.originalname.split('.').pop();
    const key = `profiles/${userId}/${type}s/${Date.now()}.${ext}`;
    const url = await this.s3Service.uploadBuffer(
      file.buffer,
      key,
      file.mimetype,
    );

    return this.mediaRepository.save({
      userId,
      type,
      url,
      orderIndex: existing.length,
    });
  }

  async deleteMedia(userId: string, mediaId: string): Promise<void> {
    const media = await this.mediaRepository.findOne({
      where: { id: mediaId, userId },
    });
    if (!media) throw new NotFoundException('Media not found');

    const key = this.s3Service.extractKeyFromUrl(media.url);
    await this.s3Service.delete(key);
    await this.mediaRepository.remove(media);
  }

  async reorderMedia(userId: string, orderedIds: string[]): Promise<void> {
    for (let i = 0; i < orderedIds.length; i++) {
      await this.mediaRepository.update(
        { id: orderedIds[i], userId },
        { orderIndex: i },
      );
    }
  }

  async addPrompt(
    userId: string,
    question: string,
    textAnswer?: string,
    audioBuffer?: Buffer,
    audioMimeType?: string,
  ): Promise<UserPrompt> {
    const existing = await this.promptRepository.count({ where: { userId } });
    if (existing >= MAX_PROMPTS) {
      throw new BadRequestException(`Maximum ${MAX_PROMPTS} prompts allowed`);
    }

    let audioUrl: string | undefined;
    if (audioBuffer) {
      const key = `profiles/${userId}/prompts/${Date.now()}.m4a`;
      audioUrl = await this.s3Service.uploadBuffer(
        audioBuffer,
        key,
        audioMimeType || 'audio/m4a',
      );
    }

    return this.promptRepository.save({
      userId,
      question,
      textAnswer,
      audioUrl,
      orderIndex: existing,
    });
  }

  async deletePrompt(userId: string, promptId: string): Promise<void> {
    const prompt = await this.promptRepository.findOne({
      where: { id: promptId, userId },
    });
    if (!prompt) throw new NotFoundException('Prompt not found');
    await this.promptRepository.remove(prompt);
  }

  getSuggestedPrompts(): string[] {
    return this.aiService.suggestPromptQuestions();
  }

  async generateBioSuggestion(userId: string): Promise<{ bio: string }> {
    const bio = await this.aiService.generateBioSuggestion(userId);
    return { bio };
  }
}
