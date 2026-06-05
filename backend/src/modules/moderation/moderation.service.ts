import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportStatus } from '../../common/enums';
import { User } from '../user/entities/user.entity';
import { Report } from './entities/report.entity';
import { CreateReportDto } from './dto/report.dto';

@Injectable()
export class ModerationService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createReport(
    reporterId: string,
    dto: CreateReportDto,
  ): Promise<Report> {
    if (reporterId === dto.reportedUserId) {
      throw new BadRequestException('You cannot report yourself');
    }
    const reportedUser = await this.userRepository.findOne({
      where: { id: dto.reportedUserId },
    });
    if (!reportedUser) throw new NotFoundException('Reported user not found');

    return this.reportRepository.save({
      reporterId,
      reportedUserId: dto.reportedUserId,
      reason: dto.reason,
      status: ReportStatus.PENDING,
      metadata: { ...(dto.metadata || {}), details: dto.details },
    });
  }

  getMyReports(reporterId: string): Promise<Report[]> {
    return this.reportRepository.find({
      where: { reporterId },
      relations: ['reportedUser'],
      order: { createdAt: 'DESC' },
    });
  }
}
