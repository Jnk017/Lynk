import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SubscriptionService } from './subscription.service';
import { SubscriptionTier, TransactionCurrency, TransactionProvider } from '../../common/enums';

class SubscribeDto {
  @ApiProperty({ enum: SubscriptionTier })
  @IsEnum(SubscriptionTier)
  tier: SubscriptionTier;

  @ApiProperty({ enum: TransactionCurrency })
  @IsEnum(TransactionCurrency)
  currency: TransactionCurrency;

  @ApiProperty({ enum: TransactionProvider })
  @IsEnum(TransactionProvider)
  provider: TransactionProvider;

  @ApiProperty({ description: 'External payment reference from provider' })
  @IsString()
  externalRef: string;
}

@ApiTags('subscription')
@Controller('subscription')
export class SubscriptionController {
  constructor(private subscriptionService: SubscriptionService) {}

  @Get('plans')
  @ApiOperation({ summary: 'Get all available subscription plans' })
  getPlans() {
    return this.subscriptionService.getAllPlans();
  }

  @Post('subscribe')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Subscribe to a plan (after payment confirmation)' })
  subscribe(@Request() req: { user: { id: string } }, @Body() dto: SubscribeDto) {
    return this.subscriptionService.subscribeToPlan(
      req.user.id,
      dto.tier,
      dto.currency,
      dto.provider,
      dto.externalRef,
    );
  }
}
