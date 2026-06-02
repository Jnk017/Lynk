import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiProperty,
} from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { SubscriptionService } from './subscription.service';
import { SubscriptionTier } from '../../common/enums';

class SubscribeDto {
  @ApiProperty({ enum: SubscriptionTier })
  @IsEnum(SubscriptionTier)
  tier: SubscriptionTier;

  @ApiProperty({
    description: 'Completed payment transaction id for paid plans',
    required: false,
  })
  @IsOptional()
  @IsString()
  paymentTransactionId?: string;
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
  @ApiOperation({
    summary: 'Activate subscription after a verified server-side payment',
  })
  subscribe(
    @Request() req: { user: { id: string } },
    @Body() dto: SubscribeDto,
  ) {
    return this.subscriptionService.subscribeToPlan(
      req.user.id,
      dto.tier,
      dto.paymentTransactionId,
    );
  }
}
