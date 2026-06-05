import {
  IsString,
  IsOptional,
  IsEmail,
  IsPhoneNumber,
  IsUUID,
  MinLength,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  currentPassword: string;

  @ApiProperty({ minLength: 12 })
  @IsString()
  @MinLength(12)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message:
      'newPassword must include at least one lowercase letter, one uppercase letter, and one number',
  })
  newPassword: string;
}
