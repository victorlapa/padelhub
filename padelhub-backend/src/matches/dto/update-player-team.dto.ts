import { IsEnum } from 'class-validator';
import { Team } from '../entities/match-player.entity';

export class UpdatePlayerTeamDto {
  @IsEnum(Team)
  team: Team;
}
