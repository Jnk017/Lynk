import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { FeatureFlagService } from './feature-flag.service';

@ApiTags('feature-flags')
@Controller('feature-flags')
export class FeatureFlagController {
  constructor(private readonly featureFlagService: FeatureFlagService) {}

  @Get('public')
  @ApiOperation({ summary: 'List public client feature flags' })
  async publicFlags(): Promise<Record<string, boolean>> {
    const flags = await this.featureFlagService.list();
    return {
      payments: flags.find((flag) => flag.key === 'payments')?.enabled ?? false,
      gifts: flags.find((flag) => flag.key === 'gifts')?.enabled ?? true,
      staking: flags.find((flag) => flag.key === 'staking')?.enabled ?? true,
      marriage: flags.find((flag) => flag.key === 'marriage')?.enabled ?? true,
      founderProgram:
        flags.find((flag) => flag.key === 'founder_program')?.enabled ?? true,
      kyc: flags.find((flag) => flag.key === 'kyc')?.enabled ?? true,
    };
  }
}
