import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MatchPlayer } from '../../matches/entities/match-player.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  firstName: string;

  @Column({ type: 'varchar', length: 100 })
  lastName: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: true, unique: true })
  googleId: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @Column({ type: 'boolean', default: false })
  isUserVerified: boolean;

  @Column({ type: 'varchar', length: 500, nullable: true })
  profilePictureUrl: string;

  @Column({ type: 'integer', default: 8 })
  category: number;

  @Column({ type: 'integer', default: 0 })
  matchesPlayed: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string;

  @Column({ type: 'enum', enum: ['left', 'right'], nullable: true })
  sidePreference: 'left' | 'right';

  @OneToMany(() => MatchPlayer, (matchPlayer) => matchPlayer.user)
  matchPlayers: MatchPlayer[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
