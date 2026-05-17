import { IsString, IsOptional, IsEmail, IsPhoneNumber } from 'class-validator';
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
}

export class PiAuthDto {
  @ApiProperty({ description: 'Pi Network access token from Pi SDK' })
  @IsString()
  accessToken: string;
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
