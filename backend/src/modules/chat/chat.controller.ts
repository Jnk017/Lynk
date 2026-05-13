import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ChatService } from './chat.service';

@ApiTags('chat')
@Controller('chat')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get('rooms')
  @ApiOperation({ summary: 'List all chat rooms for current user' })
  getRooms(@Request() req: { user: { id: string } }) {
    return this.chatService.getUserRooms(req.user.id);
  }

  @Post('rooms/match/:matchId')
  @ApiOperation({ summary: 'Get or create chat room for a match' })
  getOrCreateRoom(@Param('matchId') matchId: string) {
    return this.chatService.getOrCreateRoomForMatch(matchId);
  }

  @Get('rooms/:roomId/messages')
  @ApiOperation({ summary: 'Get messages in a chat room' })
  getMessages(
    @Request() req: { user: { id: string } },
    @Param('roomId') roomId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 50,
  ) {
    return this.chatService.getMessages(req.user.id, roomId, Number(page), Number(limit));
  }

  @Get('ice-breakers/:targetUserId')
  @ApiOperation({ summary: 'Get AI-generated ice breaker suggestions' })
  getIceBreakers(
    @Request() req: { user: { id: string } },
    @Param('targetUserId') targetUserId: string,
  ) {
    return this.chatService.getSuggestedIceBreakers(req.user.id, targetUserId);
  }
}
