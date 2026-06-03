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
}
