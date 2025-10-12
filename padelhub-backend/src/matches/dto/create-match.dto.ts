import {
  IsUUID,
  IsString,
  IsOptional,
  IsInt,
  IsEnum,
  IsBoolean,
  IsDateString,
  Min,
  MaxLength,
} from 'class-validator';
import { MatchStatus } from '../entities/match.entity';

export class CreateMatchDto {
  @IsUUID()
  clubId: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  courtId?: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsInt()
  @Min(1)
  category: number;

  @IsOptional()
  @IsEnum(MatchStatus)
  status?: MatchStatus;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  password?: string;

  @IsOptional()
  @IsBoolean()
  isCourtScheduled?: boolean;
}
