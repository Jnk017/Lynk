import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';

@Injectable()
export class AiService {
  private openai: OpenAI;

  constructor(
    private configService: ConfigService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('openai.apiKey') || 'placeholder',
    });
  }

  /**
   * Generate a user bio suggestion using OpenAI based on their lifestyle tags.
   */
  async generateBioSuggestion(userId: string): Promise<string> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) return '';

    const tags = user.lifestyleTags?.map((t: Record<string, unknown>) => t['value']).join(', ') || '';
    const prompt = `Generate a short, charming dating profile bio (max 150 words) in the user's style. 
      User details: name=${user.displayName}, tags=[${tags}].
      Make it warm, genuine, and show personality. No clichés.`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 200,
    });

    return response.choices[0]?.message?.content || '';
  }

  /**
   * Generate ice breaker conversation starters personalized to both users.
   */
  async generateIceBreakers(userId: string, targetUserId: string): Promise<string[]> {
    const [user, target] = await Promise.all([
      this.userRepository.findOne({ where: { id: userId }, relations: ['prompts'] }),
      this.userRepository.findOne({ where: { id: targetUserId }, relations: ['prompts'] }),
    ]);

    if (!user || !target) return this.getDefaultIceBreakers();

    const userTags = user.lifestyleTags?.map((t: Record<string, unknown>) => t['value']).join(', ') || '';
    const targetPrompts = target.prompts?.map((p) => `Q: ${p.question} A: ${p.textAnswer}`).join('\n') || '';

    const prompt = `Based on these two dating profiles, generate 3 creative and personalized ice-breaker messages 
    that the first person could send to the second.
    
    Person 1 interests: ${userTags}
    Person 2 profile prompts:
    ${targetPrompts}
    
    Return exactly 3 messages as a JSON array of strings. Be clever, warm, and avoid cheesy lines.`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        max_tokens: 300,
      });

      const parsed = JSON.parse(response.choices[0]?.message?.content || '{"messages":[]}');
      return parsed.messages || this.getDefaultIceBreakers();
    } catch {
      return this.getDefaultIceBreakers();
    }
  }

  /**
   * Moderate content using OpenAI Moderation API.
   * Returns true if content should be blocked.
   */
  async moderateContent(text: string): Promise<boolean> {
    try {
      const response = await this.openai.moderations.create({ input: text });
      return response.results[0]?.flagged || false;
    } catch {
      return false;
    }
  }

  /**
   * Suggest a prompt question for onboarding.
   */
  async suggestPromptQuestions(): Promise<string[]> {
    return [
      'The most spontaneous thing I\'ve ever done is...',
      'My go-to karaoke song is...',
      'The way to win me over is...',
      'I\'m looking for someone who...',
      'My ideal Sunday looks like...',
      'Controversial opinion: ...',
      'The story behind my last name is...',
    ];
  }

  private getDefaultIceBreakers(): string[] {
    return [
      "I noticed we both have great taste – want to compare notes? 😄",
      "Your profile made me smile. What's the story behind it?",
      "If we were to grab a coffee right now, what would you order?",
    ];
  }
}
