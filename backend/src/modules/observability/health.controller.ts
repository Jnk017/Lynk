import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Runtime healthcheck' })
  check() {
    return this.healthService.check();
  }

  @Get('db')
  @ApiOperation({ summary: 'PostgreSQL healthcheck' })
  checkDatabase() {
    return this.healthService.checkDatabase();
  }

  @Get('redis')
  @ApiOperation({ summary: 'Redis healthcheck' })
  checkRedis() {
    return this.healthService.checkRedis();
  }
}
