import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MatchMessagesService } from './match-messages.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Controller('matches/:matchId/messages')
export class MatchMessagesController {
  constructor(
    private readonly matchMessagesService: MatchMessagesService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Param('matchId') matchId: string,
    @Body() createMessageDto: CreateMessageDto,
  ) {
    return this.matchMessagesService.create(matchId, createMessageDto);
  }

  @Get()
  findByMatchId(
    @Param('matchId') matchId: string,
    @Query('limit') limit?: string,
    @Query('before') before?: string,
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : 50;
    return this.matchMessagesService.findByMatchId(
      matchId,
      parsedLimit,
      before,
    );
  }

  @Delete(':messageId')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(
    @Param('messageId') messageId: string,
    @Query('userId') userId: string,
  ) {
    return this.matchMessagesService.delete(messageId, userId);
  }
}
