import {
  PrimaryGeneratedColumn,
  Column,
  Entity,
  Index,
  ManyToOne,
  JoinColumn,
  DeleteDateColumn
} from 'typeorm'
import { IsInt, Min } from 'class-validator'
import { Leaderboard } from '../../leaderboards/entities/leaderboard.entity'
import { User, UserPublic } from '../../users/entities/user.entity'
import { CreatableEntity } from '../../../classes/entity/creatable'

@Entity()
export class LeaderboardEntry extends CreatableEntity {
  @DeleteDateColumn()
  deleted_at: Date

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
  user: User | UserPublic

  @Index()
  @IsInt()
  @Min(0)
  @Column({
    default: 0
  })
  points: number

  @Column({
    default: 0
  })
  wins: number

  rank?: string
}
