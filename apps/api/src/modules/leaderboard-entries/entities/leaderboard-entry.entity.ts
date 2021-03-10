import {
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn
} from 'typeorm'
import { IsInt, Min } from 'class-validator'
import { Leaderboard } from '../../leaderboards/entities/leaderboard.entity'
import { User } from '../../users/entities/user.entity'
import { League } from '../../leagues/entities/league.entity'

@Entity()
@Index(['leaderboard_id', 'user_id'], { unique: true })
export class LeaderboardEntry {
  @CreateDateColumn()
  created_at: Date

  @UpdateDateColumn()
  updated_at: Date

  @PrimaryGeneratedColumn('uuid')
  id: string

  /** Migration fields (to be deprecated) */
  @Column()
  leaderboard_id: string

  /** Migration fields (to be deprecated) */
  @Column()
  league_id: string

  /** Migration fields (to be deprecated) */
  @Column()
  user_id: string

  @ManyToOne(() => Leaderboard, (leaderboard) => leaderboard.entries)
  leaderboard: Leaderboard

  @OneToOne(() => User)
  @JoinColumn()
  user: User

  @OneToOne(() => League)
  @JoinColumn()
  league: League

  @Index()
  @IsInt()
  @Min(0)
  @Column()
  points: number

  @Column()
  wins: number
}
