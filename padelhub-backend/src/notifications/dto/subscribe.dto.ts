import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class SubscribeDto {
  @IsString()
  @IsNotEmpty()
  endpoint: string;

  @IsString()
  @IsNotEmpty()
  p256dh: string;

  @IsString()
  @IsNotEmpty()
  auth: string;

  @IsString()
  @IsOptional()
  userAgent?: string;
}
