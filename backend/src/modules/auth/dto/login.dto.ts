import {
  IsString,
  IsOptional,
  IsEmail,
  IsPhoneNumber,
  IsUUID,
  IsBoolean,
  IsEnum,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { LegalLanguage } from '../../legal/dto/legal.dto';

export class LoginDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @ApiProperty()
  @IsString()
  password: string;

  @ApiProperty({
    required: false,
    description: 'Stable client device identifier',
  })
  @IsOptional()
  @IsUUID()
  deviceId?: string;
}

export class PiAuthDto {
  @ApiProperty({ description: 'Pi Network access token from Pi SDK' })
  @IsString()
  accessToken: string;

  @ApiProperty({
    required: false,
    description: 'Required only when Pi creates a new account',
  })
  @IsOptional()
  @IsBoolean()
  termsAccepted?: boolean;

  @ApiProperty({
    required: false,
    description: 'Required only when Pi creates a new account',
  })
  @IsOptional()
  @IsBoolean()
  privacyAccepted?: boolean;

  @ApiProperty({
    required: false,
    description: 'Required only when Pi creates a new account',
  })
  @IsOptional()
  @IsBoolean()
  ageConfirmed?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  marketingConsent?: boolean;

  @ApiProperty({ enum: LegalLanguage, required: false })
  @IsOptional()
  @IsEnum(LegalLanguage)
  language?: LegalLanguage;

  @ApiProperty({ example: '2.0', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  documentVersion?: string;

  @ApiProperty({
    required: false,
    description: 'Stable client device identifier',
  })
  @IsOptional()
  @IsUUID()
  deviceId?: string;
}

export class GoogleAuthDto {
  @ApiProperty({ description: 'Google ID token' })
  @IsString()
  idToken: string;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  refreshToken: string;
}

export class LogoutDto {
  @ApiProperty()
  @IsString()
  refreshToken: string;
}
