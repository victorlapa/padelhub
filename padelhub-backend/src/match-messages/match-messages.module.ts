import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchMessage } from './entities/match-message.entity';
import { MatchMessagesService } from './match-messages.service';
import { MatchMessagesController } from './match-messages.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MatchMessage])],
  controllers: [MatchMessagesController],
  providers: [MatchMessagesService],
  exports: [MatchMessagesService],
})
export class MatchMessagesModule {}
