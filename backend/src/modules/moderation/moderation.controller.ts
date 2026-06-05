import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateReportDto } from './dto/report.dto';
import { ModerationService } from './moderation.service';

@ApiTags('moderation')
@Controller('moderation')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class ModerationController {
  constructor(private readonly moderationService: ModerationService) {}

  @Post('reports')
  @ApiOperation({ summary: 'Submit a user safety report' })
  createReport(
    @Request() req: { user: { id: string } },
    @Body() dto: CreateReportDto,
  ) {
    return this.moderationService.createReport(req.user.id, dto);
  }

  @Get('reports/me')
  @ApiOperation({ summary: 'List reports submitted by current user' })
  myReports(@Request() req: { user: { id: string } }) {
    return this.moderationService.getMyReports(req.user.id);
  }
}
