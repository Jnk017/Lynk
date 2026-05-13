import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
  IsPhoneNumber,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '../../../common/enums';

export class RegisterDto {
  @ApiProperty({ required: false, example: '+33612345678' })
  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @ApiProperty({ required: false, example: 'user@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ minLength: 8, maxLength: 64 })
  @IsString()
  @MinLength(8)
  @MaxLength(64)
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
}
