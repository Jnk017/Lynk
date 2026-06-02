import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { MAX_FOUNDERS } from '../../common/constants';
import { User } from '../user/entities/user.entity';
import { Founder } from './entities/founder.entity';

@Injectable()
export class FounderService {
  constructor(
    @InjectRepository(Founder)
    private readonly founderRepository: Repository<Founder>,
    private readonly dataSource: DataSource,
  ) {}

  async allocateFounderSlot(userId: string): Promise<Founder> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const founder = await this.allocateFounderSlotWithManager(
        queryRunner.manager,
        userId,
      );
      await queryRunner.commitTransaction();
      return founder;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async allocateFounderSlotWithManager(
    manager: EntityManager,
    userId: string,
  ): Promise<Founder> {
    await manager.query(
      `SELECT pg_advisory_xact_lock(hashtext('lynk_founder_allocation'))`,
    );

    const existing = await manager.findOne(Founder, { where: { userId } });
    if (existing) return existing;

    const founderCount = await manager.count(Founder);
    if (founderCount >= MAX_FOUNDERS) {
      throw new BadRequestException('Founder limit reached');
    }

    const founderNumber = founderCount + 1;
    const founder = await manager.save(Founder, {
      userId,
      founderNumber,
      lifetimePremium: true,
    });

    await manager.update(User, userId, {
      isFounder: true,
      founderRank: founderNumber,
    });

    return founder;
  }
}
