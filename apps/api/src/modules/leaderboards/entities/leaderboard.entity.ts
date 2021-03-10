import { CreatableEntity } from '../../../classes/entity/creatable'
import { ManyToOne, OneToMany, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { League } from '../../leagues/entities/league.entity'
import { LeaderboardEntry } from '../../leaderboard-entries/entities/leaderboard-entry.entity'

@Entity()
export class Leaderboard extends CreatableEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => League, (league) => league.leaderboards)
  league: League

  @OneToMany(
    () => LeaderboardEntry,
    (leaderboardEntry) => leaderboardEntry.leaderboard
  )
  entries: LeaderboardEntry[]
}
