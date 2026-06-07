import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsPhoneNumber,
  IsEnum,
  IsUUID,
  IsBoolean,
  IsIn,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '../../../common/enums';
import { LegalLanguage } from '../../legal/dto/legal.dto';

export class RegisterDto {
  @ApiProperty({ required: false, example: '+33612345678' })
  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @ApiProperty({ required: false, example: 'user@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    minLength: 12,
    maxLength: 64,
    description:
      'Must include at least one lowercase letter, one uppercase letter, and one number.',
  })
  @IsString()
  @MinLength(12)
  @MaxLength(64)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message:
      'password must include at least one lowercase letter, one uppercase letter, and one number',
  })
  password: string;

  @ApiProperty({ example: 'Alex Dupont' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  displayName: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  referralCode?: string;

  @ApiProperty({ enum: Gender, required: false })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiProperty({ description: 'Required acceptance of Terms of Service' })
  @IsBoolean()
  termsAccepted: boolean;

  @ApiProperty({
    description: 'Required acknowledgement of the Privacy Policy',
  })
  @IsBoolean()
  privacyAccepted: boolean;

  @ApiProperty({
    description: 'Required confirmation that the user is at least 18',
  })
  @IsBoolean()
  ageConfirmed: boolean;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  marketingConsent?: boolean;

  @ApiProperty({ enum: LegalLanguage, default: LegalLanguage.FR })
  @IsIn(Object.values(LegalLanguage))
  language: LegalLanguage;

  @ApiProperty({ example: '2.0' })
  @IsString()
  @MaxLength(20)
  documentVersion: string;

  @ApiProperty({
    required: false,
    description: 'Stable client device identifier',
  })
  @IsOptional()
  @IsUUID()
  deviceId?: string;
}
