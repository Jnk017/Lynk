import {
  Controller,
  Post,
  UseGuards,
  Request,
  UploadedFile,
  UseInterceptors,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
} from '@nestjs/swagger';
import { VerificationService } from './verification.service';

@ApiTags('verification')
@Controller('verification')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class VerificationController {
  constructor(private verificationService: VerificationService) {}

  @Post('liveness')
  @UseInterceptors(
    FileInterceptor('image', { limits: { fileSize: 5 * 1024 * 1024 } }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Submit selfie frame for AI liveness detection' })
  async verifyLiveness(
    @Request() req: { user: { id: string } },
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /^image\/(jpeg|png|webp)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.verificationService.verifyLiveness(req.user.id, file.buffer);
  }

  @Post('kyc')
  @UseInterceptors(
    FileInterceptor('document', { limits: { fileSize: 10 * 1024 * 1024 } }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Submit KYC identity document (optional, for Trust+ badge)',
  })
  async submitKyc(
    @Request() req: { user: { id: string } },
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
          new FileTypeValidator({
            fileType: /^(application\/pdf|image\/(jpeg|png|webp))$/,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    await this.verificationService.submitKyc(
      req.user.id,
      file.buffer,
      'id_document',
    );
    return { message: 'KYC document submitted for review' };
  }
}
