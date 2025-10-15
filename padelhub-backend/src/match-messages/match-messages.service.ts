import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { MatchMessage } from './entities/match-message.entity';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MatchMessagesService {
  constructor(
    @InjectRepository(MatchMessage)
    private readonly messageRepository: Repository<MatchMessage>,
  ) {}

  async create(
    matchId: string,
    createMessageDto: CreateMessageDto,
  ): Promise<MatchMessage> {
    const message = this.messageRepository.create({
      matchId,
      ...createMessageDto,
    });

    return await this.messageRepository.save(message);
  }

  async findByMatchId(
    matchId: string,
    limit: number = 50,
    before?: string,
  ): Promise<MatchMessage[]> {
    const queryBuilder = this.messageRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.user', 'user')
      .where('message.matchId = :matchId', { matchId })
      .orderBy('message.createdAt', 'DESC')
      .take(limit);

    // Pagination: get messages before a specific message ID
    if (before) {
      const beforeMessage = await this.messageRepository.findOne({
        where: { id: before },
      });

      if (beforeMessage) {
        queryBuilder.andWhere('message.createdAt < :beforeDate', {
          beforeDate: beforeMessage.createdAt,
        });
      }
    }

    const messages = await queryBuilder.getMany();

    // Return in chronological order (oldest first)
    return messages.reverse();
  }

  async findRecentMessages(
    matchId: string,
    after: Date,
    limit: number = 50,
  ): Promise<MatchMessage[]> {
    return await this.messageRepository.find({
      where: {
        matchId,
        createdAt: LessThan(after) as any,
      },
      relations: ['user'],
      order: { createdAt: 'ASC' },
      take: limit,
    });
  }

  async delete(messageId: string, userId: string): Promise<void> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // Only allow users to delete their own messages
    if (message.userId !== userId) {
      throw new NotFoundException('Message not found');
    }

    await this.messageRepository.remove(message);
  }
}
