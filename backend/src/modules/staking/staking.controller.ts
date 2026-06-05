import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IsString, IsNumber, IsDateString, IsUUID, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { StakingService } from './staking.service';

class CreateStakeDto {
  @ApiProperty()
  @IsUUID()
  partnerId: string;

  @ApiProperty({ description: 'Amount in Pi each party stakes' })
  @IsNumber()
  @Min(0.001)
  stakeAmountPiEach: number;

  @ApiProperty()
  @IsDateString()
  dateScheduledAt: string;

  @ApiProperty()
  @IsString()
  dateLocation: string;
}

class ConfirmAttendanceDto {
  @ApiProperty()
  @IsNumber()
  lat: number;

  @ApiProperty()
  @IsNumber()
  lng: number;
}

@ApiTags('staking')
@Controller('staking')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class StakingController {
  constructor(private stakingService: StakingService) {}

  @Get('contracts')
  @ApiOperation({ summary: 'List current user staking contracts' })
  list(@Request() req: { user: { id: string } }) {
    return this.stakingService.getUserContracts(req.user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create anti-ghosting stake for an IRL date' })
  create(
    @Request() req: { user: { id: string } },
    @Body() dto: CreateStakeDto,
  ) {
    return this.stakingService.createStake(
      req.user.id,
      dto.partnerId,
      dto.stakeAmountPiEach,
      new Date(dto.dateScheduledAt),
      dto.dateLocation,
    );
  }

  @Post(':contractId/confirm')
  @ApiOperation({ summary: 'Confirm date attendance (geolocation)' })
  confirm(
    @Request() req: { user: { id: string } },
    @Param('contractId') contractId: string,
    @Body() dto: ConfirmAttendanceDto,
  ) {
    return this.stakingService.confirmAttendance(
      req.user.id,
      contractId,
      dto.lat,
      dto.lng,
    );
  }
}
