import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Ip,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AcceptLegalDocumentDto, DeleteAccountDto } from './dto/legal.dto';
import { LegalService } from './legal.service';

@ApiTags('legal & privacy')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('legal')
export class LegalController {
  constructor(private readonly legalService: LegalService) {}
  private context(ipAddress: string, userAgent: string) {
    return { ipAddress, userAgent };
  }

  @Get('acceptances')
  @ApiOperation({ summary: 'List the current user legal acceptance history' })
  list(@Request() req: { user: { id: string } }) {
    return this.legalService.list(req.user.id);
  }

  @Post('acceptances')
  accept(
    @Request() req: { user: { id: string } },
    @Body() dto: AcceptLegalDocumentDto,
    @Ip() ip: string,
    @Headers('user-agent') ua: string,
  ) {
    return this.legalService.accept(req.user.id, dto, this.context(ip, ua));
  }

  @Delete('acceptances/:id')
  revoke(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
    @Ip() ip: string,
    @Headers('user-agent') ua: string,
  ) {
    return this.legalService.revoke(req.user.id, id, this.context(ip, ua));
  }

  @Get('data-export')
  exportData(
    @Request() req: { user: { id: string } },
    @Ip() ip: string,
    @Headers('user-agent') ua: string,
  ) {
    return this.legalService.exportData(req.user.id, this.context(ip, ua));
  }

  @Post('account-deletion')
  requestDeletion(
    @Request() req: { user: { id: string } },
    @Body() dto: DeleteAccountDto,
    @Ip() ip: string,
    @Headers('user-agent') ua: string,
  ) {
    return this.legalService.requestDeletion(
      req.user.id,
      dto,
      this.context(ip, ua),
    );
  }

  @Delete('account-deletion')
  cancelDeletion(
    @Request() req: { user: { id: string } },
    @Ip() ip: string,
    @Headers('user-agent') ua: string,
  ) {
    return this.legalService.cancelDeletion(req.user.id, this.context(ip, ua));
  }
}
