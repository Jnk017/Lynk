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

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  deviceId?: string;
}

export class PiAuthDto {
  @ApiProperty()
  @IsString()
  uid: string;

  @ApiProperty()
  @IsString()
  accessToken: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  piWalletAddress?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  termsAccepted?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  privacyAccepted?: boolean;

  @ApiProperty({ required: false })
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

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  deviceId?: string;
}

export class GoogleAuthDto {
  @ApiProperty()
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
