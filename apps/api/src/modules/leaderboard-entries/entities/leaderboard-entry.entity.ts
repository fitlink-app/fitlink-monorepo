import {
  PrimaryGeneratedColumn,
  Column,
  Entity,
  Index,
  ManyToOne,
  JoinColumn
} from 'typeorm'
import { IsInt, Min } from 'class-validator'
import { Leaderboard } from '../../leaderboards/entities/leaderboard.entity'
import { User } from '../../users/entities/user.entity'
import { CreatableEntity } from '../../../classes/entity/creatable'

@Entity()
export class LeaderboardEntry extends CreatableEntity {
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

  @ManyToOne(() => User)
  @JoinColumn()
  user: User

  @Index()
  @IsInt()
  @Min(0)
  @Column()
  points: number

  @Column()
  wins: number
}
