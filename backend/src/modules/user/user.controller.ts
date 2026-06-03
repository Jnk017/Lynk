import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UserService } from './user.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@ApiTags('users')
@Controller('users')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class UserController {
  constructor(private userService: UserService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user full profile' })
  getMe(@Request() req: { user: { id: string } }) {
    return this.userService.findById(req.user.id);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  updateMe(
    @Request() req: { user: { id: string } },
    @Body() dto: UpdateProfileDto,
  ) {
    return this.userService.updateProfile(req.user.id, dto);
  }

  @Get(':id/profile')
  @ApiOperation({ summary: 'Get public profile of a user' })
  getPublicProfile(
    @Request() req: { user: { id: string } },
    @Param('id') targetId: string,
  ) {
    return this.userService.getPublicProfile(req.user.id, targetId);
  }
}
