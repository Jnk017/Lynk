import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import {
  ReportReason,
  ReportStatus,
  VerificationStatus,
} from '../../../common/enums';

export class AdminListQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

export class AdminUserQueryDto extends AdminListQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;
}

export class AdminReportQueryDto extends AdminListQueryDto {
  @IsOptional()
  @IsEnum(ReportStatus)
  status?: ReportStatus;

  @IsOptional()
  @IsEnum(ReportReason)
  reason?: ReportReason;
}

export class ReviewVerificationDto {
  @IsEnum(VerificationStatus)
  status: VerificationStatus.VERIFIED | VerificationStatus.REJECTED;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

export class SuspendUserDto {
  @IsString()
  @IsNotEmpty()
  reason: string;
}

export class ResolveReportDto {
  @IsEnum(ReportStatus)
  status: ReportStatus.RESOLVED | ReportStatus.DISMISSED;

  @IsString()
  @IsNotEmpty()
  resolution: string;
}

export class RevenueDryRunDto {
  @IsString()
  @Matches(/^\d{4}-\d{2}$/)
  month: string;
}

export class UpsertSystemSettingDto {
  @IsObject()
  value: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}

export class UpsertFeatureFlagDto {
  @IsBoolean()
  enabled: boolean;

  @IsOptional()
  @IsObject()
  rules?: Record<string, unknown>;
}
