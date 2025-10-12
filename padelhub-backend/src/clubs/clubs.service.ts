import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Club } from './entities/club.entity';
import { CreateClubDto } from './dto/create-club.dto';
import { UpdateClubDto } from './dto/update-club.dto';

@Injectable()
export class ClubsService {
  constructor(
    @InjectRepository(Club)
    private readonly clubRepository: Repository<Club>,
  ) {}

  async create(createClubDto: CreateClubDto): Promise<Club> {
    const club = this.clubRepository.create(createClubDto);
    return await this.clubRepository.save(club);
  }

  async findAll(): Promise<Club[]> {
    return await this.clubRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Club> {
    const club = await this.clubRepository.findOne({ where: { id } });

    if (!club) {
      throw new NotFoundException(`Club with ID ${id} not found`);
    }

    return club;
  }

  async update(id: string, updateClubDto: UpdateClubDto): Promise<Club> {
    const club = await this.findOne(id);
    Object.assign(club, updateClubDto);
    return await this.clubRepository.save(club);
  }

  async remove(id: string): Promise<void> {
    const club = await this.findOne(id);
    await this.clubRepository.remove(club);
  }
}
