import { IsString } from 'class-validator';
export class PiLoginDto {
  @IsString() uid: string;
  @IsString() username: string;
  @IsString() accessToken: string;
}
