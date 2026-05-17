import {
  Controller,
  Post,
  Delete,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
  UploadedFile,
  UseInterceptors,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ProfileService } from './profile.service';
import { MediaType } from '../../common/enums';

class AddPromptDto {
  @ApiProperty()
  @IsString()
  question: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  textAnswer?: string;
}

@ApiTags('profile')
@Controller('profile')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class ProfileController {
  constructor(private profileService: ProfileService) {}

  @Post('media/photo')
  @UseInterceptors(FileInterceptor('photo', { limits: { fileSize: 10 * 1024 * 1024 } }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a profile photo' })
  uploadPhoto(@Request() req: { user: { id: string } }, @UploadedFile() file: Express.Multer.File) {
    return this.profileService.uploadMedia(req.user.id, file, MediaType.PHOTO);
  }

  @Post('media/video')
  @UseInterceptors(FileInterceptor('video', { limits: { fileSize: 50 * 1024 * 1024 } }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a profile video' })
  uploadVideo(@Request() req: { user: { id: string } }, @UploadedFile() file: Express.Multer.File) {
    return this.profileService.uploadMedia(req.user.id, file, MediaType.VIDEO);
  }

  @Delete('media/:mediaId')
  @ApiOperation({ summary: 'Delete a media item' })
  deleteMedia(@Request() req: { user: { id: string } }, @Param('mediaId') mediaId: string) {
    return this.profileService.deleteMedia(req.user.id, mediaId);
  }

  @Post('prompts')
  @ApiOperation({ summary: 'Add a prompt (Hinge-style text or audio response)' })
  addPrompt(@Request() req: { user: { id: string } }, @Body() dto: AddPromptDto) {
    return this.profileService.addPrompt(req.user.id, dto.question, dto.textAnswer);
  }

  @Delete('prompts/:promptId')
  @ApiOperation({ summary: 'Delete a prompt' })
  deletePrompt(@Request() req: { user: { id: string } }, @Param('promptId') promptId: string) {
    return this.profileService.deletePrompt(req.user.id, promptId);
  }

  @Get('prompts/suggestions')
  @ApiOperation({ summary: 'Get AI-suggested prompt questions' })
  getSuggestedPrompts() {
    return this.profileService.getSuggestedPrompts();
  }

  @Get('bio/suggestion')
  @ApiOperation({ summary: 'Generate AI bio suggestion based on lifestyle tags' })
  generateBio(@Request() req: { user: { id: string } }) {
    return this.profileService.generateBioSuggestion(req.user.id);
  }
}
