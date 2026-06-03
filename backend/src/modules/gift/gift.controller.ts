import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IsUUID, IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { GiftService } from './gift.service';
import { TransactionCurrency } from '../../common/enums';

class SendGiftDto {
  @ApiProperty()
  @IsUUID()
  receiverId: string;

  @ApiProperty()
  @IsUUID()
  giftCatalogId: string;

  @ApiProperty({ enum: TransactionCurrency })
  @IsEnum(TransactionCurrency)
  currency: TransactionCurrency;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  message?: string;
}

@ApiTags('gifts')
@Controller('gifts')
export class GiftController {
  constructor(private giftService: GiftService) {}

  @Get('catalog')
  @ApiOperation({ summary: 'Get virtual gift catalog' })
  getCatalog() {
    return this.giftService.getCatalog();
  }

  @Post('send')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send a virtual gift to another user' })
  send(@Request() req: { user: { id: string } }, @Body() dto: SendGiftDto) {
    return this.giftService.sendGift(
      req.user.id,
      dto.receiverId,
      dto.giftCatalogId,
      dto.currency,
      dto.message,
    );
  }
}
