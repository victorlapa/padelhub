import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MatchesService } from './matches.service';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';
import { AddPlayerDto } from './dto/add-player.dto';
import { UpdatePlayerTeamDto } from './dto/update-player-team.dto';

@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createMatchDto: CreateMatchDto) {
    return this.matchesService.create(createMatchDto);
  }

  @Get()
  findAll() {
    return this.matchesService.findAll();
  }

  @Get('user/:userId')
  findByUserId(@Param('userId') userId: string) {
    return this.matchesService.findByUserId(userId);
  }

  @Get(':matchId')
  findOne(@Param('matchId') matchId: string) {
    return this.matchesService.findOne(matchId);
  }

  @Patch(':matchId')
  update(
    @Param('matchId') matchId: string,
    @Body() updateMatchDto: UpdateMatchDto,
  ) {
    return this.matchesService.update(matchId, updateMatchDto);
  }

  @Delete(':matchId')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('matchId') matchId: string) {
    return this.matchesService.remove(matchId);
  }

  @Post(':matchId/players')
  @HttpCode(HttpStatus.CREATED)
  addPlayer(
    @Param('matchId') matchId: string,
    @Body() addPlayerDto: AddPlayerDto,
  ) {
    return this.matchesService.addPlayer(matchId, addPlayerDto);
  }

  @Delete(':matchId/players/:userId')
  @HttpCode(HttpStatus.OK)
  removePlayer(
    @Param('matchId') matchId: string,
    @Param('userId') userId: string,
  ) {
    return this.matchesService.removePlayer(matchId, userId);
  }

  @Patch(':matchId/players/:userId/team')
  updatePlayerTeam(
    @Param('matchId') matchId: string,
    @Param('userId') userId: string,
    @Body() updatePlayerTeamDto: UpdatePlayerTeamDto,
  ) {
    return this.matchesService.updatePlayerTeam(
      matchId,
      userId,
      updatePlayerTeamDto,
    );
  }

  @Get(':matchId/players')
  getMatchPlayers(@Param('matchId') matchId: string) {
    return this.matchesService.getMatchPlayers(matchId);
  }
}
