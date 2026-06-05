import { ApiProperty } from '@nestjs/swagger';
import {
  IsIn,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export const REPORT_REASONS = [
  'fake_account',
  'harassment',
  'spam',
  'inappropriate_content',
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number];

export class CreateReportDto {
  @ApiProperty()
  @IsUUID()
  reportedUserId: string;

  @ApiProperty({ enum: REPORT_REASONS })
  @IsIn(REPORT_REASONS)
  reason: ReportReason;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  details?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
