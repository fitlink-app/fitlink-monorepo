import {
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  UpdateDateColumn
} from 'typeorm'
import { IsInt, Min } from 'class-validator'

@Entity()
@Index(['leaderboard_id', 'user_id'], { unique: true })
export class LeaderboardEntry {
  @CreateDateColumn()
  created_at: Date

  @UpdateDateColumn()
  updated_at: Date

  @PrimaryGeneratedColumn('uuid')
  leaderboard_entry_id: string

  @Column()
  leaderboard_id: string

  @Column()
  league_id: string

  @Column()
  user_id: string

  @Index()
  @IsInt()
  @Min(0)
  @Column()
  points: number

  @Column()
  wins: number
}
