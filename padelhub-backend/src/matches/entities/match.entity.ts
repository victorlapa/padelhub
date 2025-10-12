import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Club } from '../../clubs/entities/club.entity';
import { MatchPlayer } from './match-player.entity';

export enum MatchStatus {
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  IN_PROGRESS = 'IN_PROGRESS',
  PENDING = 'PENDING',
}

@Entity('matches')
export class Match {
  @PrimaryGeneratedColumn('uuid')
  matchId: string;

  @Column({ type: 'uuid' })
  clubId: string;

  @ManyToOne(() => Club, { eager: true })
  @JoinColumn({ name: 'clubId' })
  club: Club;

  @Column({ type: 'varchar', length: 100, nullable: true })
  courtId: string;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

  @Column({ type: 'integer' })
  category: number;

  @Column({
    type: 'enum',
    enum: MatchStatus,
    default: MatchStatus.PENDING,
  })
  status: MatchStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  password: string;

  @Column({ type: 'boolean', default: false })
  isCourtScheduled: boolean;

  @OneToMany(() => MatchPlayer, (matchPlayer) => matchPlayer.match)
  matchPlayers: MatchPlayer[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
