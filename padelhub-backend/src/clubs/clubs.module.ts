import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Club } from './entities/club.entity';
import { ClubsService } from './clubs.service';
import { ClubsController } from './clubs.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Club])],
  exports: [TypeOrmModule],
  providers: [ClubsService],
  controllers: [ClubsController],
})
export class ClubsModule {}
