import { Controller, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IsUUID, IsNumber, IsString, IsUrl, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MarriageService } from './marriage.service';

class InitiateMarriageStakeDto {
  @ApiProperty()
  @IsUUID()
  partnerId: string;

  @ApiProperty({ description: 'Total amount in Pi to stake (split equally)' })
  @IsNumber()
  @Min(1)
  amountPi: number;
}

class SubmitMarriageProofDto {
  @ApiProperty({ description: 'URL of marriage certificate document' })
  @IsString()
  marriageProofUrl: string;

  @ApiProperty({ description: 'URL of verification photo with embedded code' })
  @IsString()
  marriagePhotoUrl: string;
}

@ApiTags('marriage-stake')
@Controller('marriage-stake')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class MarriageController {
  constructor(private marriageService: MarriageService) {}

  @Post()
  @ApiOperation({ summary: 'Initiate a Marriage Stake (Gold/Platinum only)' })
  initiate(@Request() req: { user: { id: string } }, @Body() dto: InitiateMarriageStakeDto) {
    return this.marriageService.initiateStake(req.user.id, dto.partnerId, dto.amountPi);
  }

  @Post(':stakeId/proof')
  @ApiOperation({ summary: 'Submit marriage proof documents' })
  submitProof(
    @Request() req: { user: { id: string } },
    @Param('stakeId') stakeId: string,
    @Body() dto: SubmitMarriageProofDto,
  ) {
    return this.marriageService.submitProof(req.user.id, stakeId, dto.marriageProofUrl, dto.marriagePhotoUrl);
  }
}
