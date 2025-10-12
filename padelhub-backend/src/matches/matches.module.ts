import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Match } from './entities/match.entity';
import { MatchPlayer } from './entities/match-player.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Match, MatchPlayer])],
  exports: [TypeOrmModule],
})
export class MatchesModule {}
