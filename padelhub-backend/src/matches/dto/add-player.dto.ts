import { IsUUID, IsOptional, IsEnum } from 'class-validator';
import { Team } from '../entities/match-player.entity';

export class AddPlayerDto {
  @IsUUID()
  userId: string;

  @IsOptional()
  @IsEnum(Team)
  team?: Team;
}
