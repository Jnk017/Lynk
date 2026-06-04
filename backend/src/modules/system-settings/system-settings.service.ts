import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemSetting } from './entities/system-setting.entity';

@Injectable()
export class SystemSettingsService {
  constructor(
    @InjectRepository(SystemSetting)
    private readonly settingsRepository: Repository<SystemSetting>,
  ) {}

  async getNumber(key: string, fallback: number): Promise<number> {
    const setting = await this.settingsRepository.findOne({ where: { key } });
    const rawValue = setting?.value?.value;
    const value = typeof rawValue === 'number' ? rawValue : Number(rawValue);
    return Number.isFinite(value) ? value : fallback;
  }

  async list(includePrivate = false): Promise<SystemSetting[]> {
    return this.settingsRepository.find({
      where: includePrivate ? {} : { isPublic: true },
      order: { key: 'ASC' },
    });
  }

  async upsert(
    key: string,
    input: { value: Record<string, unknown>; isPublic?: boolean },
  ): Promise<SystemSetting> {
    const existing = await this.settingsRepository.findOne({ where: { key } });
    return this.settingsRepository.save({
      ...(existing || {}),
      key,
      value: input.value,
      isPublic: input.isPublic ?? existing?.isPublic ?? false,
    });
  }
}
