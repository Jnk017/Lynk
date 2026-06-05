import {
  IsOptional,
  IsString,
  MaxLength,
  IsDateString,
  IsEnum,
  IsArray,
  IsBoolean,
  IsObject,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '../../../common/enums';

export class UpdateProfileDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  displayName?: string;

  @ApiProperty({ required: false, maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  occupation?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  education?: string;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  interests?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(90)
  @Max(250)
  heightCm?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  religion?: string;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languages?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  profileVisible?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  showDistance?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  showAge?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  pushNotificationsEnabled?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  emailNotificationsEnabled?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  birthdate?: string;

  @ApiProperty({ enum: Gender, required: false })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiProperty({
    required: false,
    description: 'Array of lifestyle tag objects',
  })
  @IsOptional()
  @IsArray()
  lifestyleTags?: Record<string, unknown>[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  location?: { lat: number; lng: number; city?: string; country?: string };

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  blockContacts?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  preferences?: {
    ageMin?: number;
    ageMax?: number;
    distanceKm?: number;
    genders?: string[];
    bumbleMode?: boolean;
  };
}

export class UpdatePreferencesDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(18)
  @Max(100)
  ageMin?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(18)
  @Max(100)
  ageMax?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(20000)
  distanceKm?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  genders?: string[];

  @ApiProperty({
    required: false,
    description: 'Enable Bumble mode (matched user sends first message)',
  })
  @IsOptional()
  @IsBoolean()
  bumbleMode?: boolean;
}
