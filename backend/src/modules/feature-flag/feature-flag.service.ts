import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FeatureFlag } from './entities/feature-flag.entity';

@Injectable()
export class FeatureFlagService {
  constructor(
    @InjectRepository(FeatureFlag)
    private readonly featureFlagRepository: Repository<FeatureFlag>,
  ) {}

  async list(): Promise<FeatureFlag[]> {
    return this.featureFlagRepository.find({ order: { key: 'ASC' } });
  }

  async upsert(
    key: string,
    input: { enabled: boolean; rules?: Record<string, unknown> },
  ): Promise<FeatureFlag> {
    const existing = await this.featureFlagRepository.findOne({
      where: { key },
    });
    return this.featureFlagRepository.save({
      ...(existing || {}),
      key,
      enabled: input.enabled,
      rules: input.rules || existing?.rules || {},
    });
  }
}
