import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Match } from './entities/match.entity';
import { MatchPlayer } from './entities/match-player.entity';
import { MatchesService } from './matches.service';
import { MatchesController } from './matches.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Match, MatchPlayer])],
  exports: [TypeOrmModule],
  providers: [MatchesService],
  controllers: [MatchesController],
})
export class MatchesModule {}
