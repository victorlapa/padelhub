import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const user = this.userRepository.create(createUserDto);
    return await this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateUserDto.email },
      });

      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }
    }

    Object.assign(user, updateUserDto);
    return await this.userRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }

  async findByEmailOrGoogleId(
    email: string,
    googleId: string,
  ): Promise<User | null> {
    return await this.userRepository.findOne({
      where: [{ email }, { googleId }],
    });
  }

  async createFromGoogle(data: {
    email: string;
    firstName: string;
    lastName: string;
    profilePictureUrl?: string;
    googleId: string;
  }): Promise<User> {
    const user = this.userRepository.create({
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      profilePictureUrl: data.profilePictureUrl,
      googleId: data.googleId,
      isUserVerified: true, // Auto-verify Google users
    });

    return await this.userRepository.save(user);
  }

  async updateGoogleId(id: string, googleId: string): Promise<User> {
    const user = await this.findOne(id);
    user.googleId = googleId;
    user.isUserVerified = true; // Verify user when linking Google account
    return await this.userRepository.save(user);
  }
}
