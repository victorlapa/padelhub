import {
  IsEmail,
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  IsEnum,
  MinLength,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  firstName: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  lastName: string;

  @IsEmail()
  @MaxLength(255)
  email: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsOptional()
  @IsBoolean()
  isUserVerified?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  profilePictureUrl?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  category?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  matchesPlayed?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @IsOptional()
  @IsEnum(['left', 'right'])
  sidePreference?: 'left' | 'right';
}
