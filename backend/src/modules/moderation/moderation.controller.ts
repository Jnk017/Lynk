import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateReportDto } from './dto/moderation.dto';
import { ModerationService } from './moderation.service';

interface UserRequest {
  user: { id: string };
}

@ApiTags('safety')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('safety')
export class ModerationController {
  constructor(private readonly moderationService: ModerationService) {}

  @Post('reports')
  @ApiOperation({ summary: 'Submit a user safety report' })
  createReport(@Request() req: UserRequest, @Body() dto: CreateReportDto) {
    return this.moderationService.createReport(req.user.id, dto);
  }

  @Get('reports/me')
  @ApiOperation({ summary: 'View the signed-in member report history' })
  listMyReports(@Request() req: UserRequest) {
    return this.moderationService.listMyReports(req.user.id);
  }

  @Post('blocks/:userId')
  @ApiOperation({ summary: 'Block a member and end matching interactions' })
  blockUser(@Request() req: UserRequest, @Param('userId') userId: string) {
    return this.moderationService.blockUser(req.user.id, userId);
  }

  @Delete('blocks/:userId')
  @ApiOperation({ summary: 'Unblock a member' })
  async unblockUser(
    @Request() req: UserRequest,
    @Param('userId') userId: string,
  ) {
    await this.moderationService.unblockUser(req.user.id, userId);
    return { success: true };
  }

  @Get('blocks')
  @ApiOperation({ summary: 'View blocked members' })
  listBlockedUsers(@Request() req: UserRequest) {
    return this.moderationService.listBlockedUsers(req.user.id);
  }
}
