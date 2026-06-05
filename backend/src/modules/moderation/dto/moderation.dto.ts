import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { ReportReason } from '../../../common/enums';

export class CreateReportDto {
  @IsUUID()
  reportedUserId: string;

  @IsEnum(ReportReason)
  reason: ReportReason;

  @IsOptional()
  @IsString()
  @MaxLength(1500)
  details?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  evidenceNote?: string;
}

export class BlockUserDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;
}
