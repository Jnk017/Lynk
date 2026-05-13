import { Controller, Get, UseGuards, Request, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ReferralService } from './referral.service';

@ApiTags('referral')
@Controller('referral')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class ReferralController {
  constructor(private referralService: ReferralService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get referral stats and Founder status' })
  getStats(@Request() req: { user: { id: string } }) {
    return this.referralService.getReferralStats(req.user.id);
  }

  @Get('distributions')
  @ApiOperation({ summary: 'Get personal revenue share distributions' })
  getDistributions(@Request() req: { user: { id: string } }) {
    return this.referralService.getFounderDistributions(req.user.id);
  }

  @Get('pools')
  @ApiOperation({ summary: 'Get revenue pool history' })
  getPoolHistory(@Query('limit') limit = 12) {
    return this.referralService.getRevenuePoolHistory(Number(limit));
  }
}
