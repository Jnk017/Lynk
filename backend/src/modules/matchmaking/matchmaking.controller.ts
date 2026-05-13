import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IsEnum, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MatchmakingService } from './matchmaking.service';
import { SwipeAction } from '../../common/enums';

class SwipeDto {
  @ApiProperty({ enum: SwipeAction })
  @IsEnum(SwipeAction)
  action: SwipeAction;
}

@ApiTags('matchmaking')
@Controller('matchmaking')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class MatchmakingController {
  constructor(private matchmakingService: MatchmakingService) {}

  @Post('swipe/:targetUserId')
  @ApiOperation({ summary: 'Swipe on a user (like, dislike, super_like)' })
  swipe(
    @Request() req: { user: { id: string } },
    @Param('targetUserId') targetId: string,
    @Body() dto: SwipeDto,
  ) {
    return this.matchmakingService.swipe(req.user.id, targetId, dto.action);
  }

  @Get('discovery')
  @ApiOperation({ summary: 'Get discovery feed (swipe mode or TikTok-style)' })
  getDiscovery(
    @Request() req: { user: { id: string } },
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.matchmakingService.getDiscoveryFeed(req.user.id, Number(page), Number(limit));
  }

  @Post('ai-session')
  @ApiOperation({ summary: 'Start AI Matchmaker session (Platinum only)' })
  startAiSession(@Request() req: { user: { id: string } }) {
    return this.matchmakingService.startMatchmakingSession(req.user.id);
  }

  @Patch('ai-session/:sessionId/drop/:profileId')
  @ApiOperation({ summary: 'Drop a profile from AI Matchmaker session' })
  dropProfile(
    @Request() req: { user: { id: string } },
    @Param('sessionId') sessionId: string,
    @Param('profileId') profileId: string,
  ) {
    return this.matchmakingService.dropSessionProfile(req.user.id, sessionId, profileId);
  }

  @Post('ai-session/:sessionId/choose/:profileId')
  @ApiOperation({ summary: 'Make final choice in AI Matchmaker session' })
  makeChoice(
    @Request() req: { user: { id: string } },
    @Param('sessionId') sessionId: string,
    @Param('profileId') profileId: string,
  ) {
    return this.matchmakingService.makeFinalChoice(req.user.id, sessionId, profileId);
  }
}
