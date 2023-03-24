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

// when saving numbers as bigint postgress will return them as strings, we use this to convert them to integers
export class ColumnNumberTransformer {
  public to(data: number): number {
    return data
  }

  public from(data: string): number {
    // output value, you can use Number, parseFloat variations
    // also you can add nullable condition:
    // if (!Boolean(data)) return 0;

    return parseInt(data)
  }
}

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

  // bfit accumulated in this league if it's a compete to earn league
  @Column({
    type: 'bigint',
    default: 0,
    transformer: new ColumnNumberTransformer()
  })
  bfit_earned: number

  // bfit accumulated in this league if it's a compete to earn league
  @Column({
    type: 'bigint',
    default: 0,
    transformer: new ColumnNumberTransformer()
  })
  bfit_estimate: number

  // bfit accumulated in this league if it's a compete to earn league
  @Column({
    type: 'bigint',
    default: 0,
    transformer: new ColumnNumberTransformer()
  })
  bfit_claimed: number

  @Column({
    default: 0
  })
  wins: number

  rank?: string
}
