import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Match } from './match.entity';
import { User } from '../../users/entities/user.entity';

export enum Team {
  UNASSIGNED = 'UNASSIGNED',
  A = 'A',
  B = 'B',
}

@Entity('match_players')
export class MatchPlayer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  matchId: string;

  @ManyToOne(() => Match, (match) => match.matchPlayers)
  @JoinColumn({ name: 'matchId' })
  match: Match;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, (user) => user.matchPlayers, { eager: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({
    type: 'enum',
    enum: Team,
    default: Team.UNASSIGNED,
  })
  team: Team;

  @CreateDateColumn()
  joinedAt: Date;
}
