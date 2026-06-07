import {
  IsBoolean,
  IsEnum,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export const LEGAL_DOCUMENT_TYPES = [
  'terms',
  'privacy',
  'dpa',
  'cookies',
  'community',
  'safety',
  'kyc',
  'wallet',
  'retention',
  'deletion',
  'copyright',
  'intellectual-property',
  'law-enforcement',
  'acceptable-use',
  'anti-fraud',
  'anti-scam',
  'aml',
  'sanctions',
  'children-protection',
  'transparency',
  'marketing',
] as const;
export type LegalDocumentType = (typeof LEGAL_DOCUMENT_TYPES)[number];
export enum LegalLanguage {
  FR = 'fr',
  EN = 'en',
  ES = 'es',
}

export class AcceptLegalDocumentDto {
  @ApiProperty({ enum: LEGAL_DOCUMENT_TYPES })
  @IsIn(LEGAL_DOCUMENT_TYPES)
  documentType: LegalDocumentType;

  @ApiProperty({ example: '2.0' })
  @IsString()
  @MaxLength(20)
  documentVersion: string;

  @ApiProperty({ enum: LegalLanguage })
  @IsEnum(LegalLanguage)
  language: LegalLanguage;
}

export class RegistrationConsentDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  termsAccepted: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  privacyAccepted: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  ageConfirmed: boolean;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  marketingConsent?: boolean;

  @ApiProperty({ enum: LegalLanguage, default: LegalLanguage.FR })
  @IsEnum(LegalLanguage)
  language: LegalLanguage;

  @ApiProperty({ example: '2.0' })
  @IsString()
  documentVersion: string;
}

export class DeleteAccountDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  password: string;

  @ApiProperty({
    description: 'Explicit acknowledgement of the deletion consequences.',
  })
  @IsBoolean()
  confirmDeletion: boolean;
}
