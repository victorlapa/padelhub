import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match } from './entities/match.entity';
import { MatchPlayer } from './entities/match-player.entity';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';
import { AddPlayerDto } from './dto/add-player.dto';
import { UpdatePlayerTeamDto } from './dto/update-player-team.dto';
import { Team } from './entities/match-player.entity';

@Injectable()
export class MatchesService {
  constructor(
    @InjectRepository(Match)
    private readonly matchRepository: Repository<Match>,
    @InjectRepository(MatchPlayer)
    private readonly matchPlayerRepository: Repository<MatchPlayer>,
  ) {}

  async create(createMatchDto: CreateMatchDto): Promise<Match> {
    const match = this.matchRepository.create(createMatchDto);
    return await this.matchRepository.save(match);
  }

  async findAll(): Promise<Match[]> {
    return await this.matchRepository.find({
      relations: ['club', 'matchPlayers'],
      order: { startDate: 'DESC' },
    });
  }

  async findOne(matchId: string): Promise<Match> {
    const match = await this.matchRepository.findOne({
      where: { matchId },
      relations: ['club', 'matchPlayers', 'matchPlayers.user'],
    });

    if (!match) {
      throw new NotFoundException(`Match with ID ${matchId} not found`);
    }

    return match;
  }

  async update(
    matchId: string,
    updateMatchDto: UpdateMatchDto,
  ): Promise<Match> {
    const match = await this.findOne(matchId);
    Object.assign(match, updateMatchDto);
    return await this.matchRepository.save(match);
  }

  async remove(matchId: string): Promise<void> {
    const match = await this.findOne(matchId);
    await this.matchRepository.remove(match);
  }

  async addPlayer(matchId: string, addPlayerDto: AddPlayerDto): Promise<Match> {
    const match = await this.findOne(matchId);

    // Check if player is already in the match
    const existingPlayer = await this.matchPlayerRepository.findOne({
      where: { matchId, userId: addPlayerDto.userId },
    });

    if (existingPlayer) {
      throw new ConflictException('Player is already in this match');
    }

    const matchPlayer = this.matchPlayerRepository.create({
      matchId,
      userId: addPlayerDto.userId,
      team: addPlayerDto.team || Team.UNASSIGNED,
    });

    await this.matchPlayerRepository.save(matchPlayer);
    return await this.findOne(matchId);
  }

  async removePlayer(matchId: string, userId: string): Promise<Match> {
    const matchPlayer = await this.matchPlayerRepository.findOne({
      where: { matchId, userId },
    });

    if (!matchPlayer) {
      throw new NotFoundException('Player not found in this match');
    }

    await this.matchPlayerRepository.remove(matchPlayer);
    return await this.findOne(matchId);
  }

  async updatePlayerTeam(
    matchId: string,
    userId: string,
    updatePlayerTeamDto: UpdatePlayerTeamDto,
  ): Promise<Match> {
    const matchPlayer = await this.matchPlayerRepository.findOne({
      where: { matchId, userId },
    });

    if (!matchPlayer) {
      throw new NotFoundException('Player not found in this match');
    }

    matchPlayer.team = updatePlayerTeamDto.team;
    await this.matchPlayerRepository.save(matchPlayer);
    return await this.findOne(matchId);
  }

  async getMatchPlayers(matchId: string): Promise<MatchPlayer[]> {
    await this.findOne(matchId); // Verify match exists

    return await this.matchPlayerRepository.find({
      where: { matchId },
      relations: ['user'],
      order: { joinedAt: 'ASC' },
    });
  }
}
