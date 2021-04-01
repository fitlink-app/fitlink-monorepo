import {
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToMany,
  Entity,
  OneToOne,
  JoinColumn,
  Column,
  JoinTable,
  ManyToOne
} from 'typeorm'
import { CreatableByUserEntity } from '../../../classes/entity/creatable'
import { Leaderboard } from '../../leaderboards/entities/leaderboard.entity'
import { Sport } from '../../sports/entities/sport.entity'
import { Team } from '../../teams/entities/team.entity'
import { User } from '../../users/entities/user.entity'

@Entity()
export class League extends CreatableByUserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => Sport)
  @JoinColumn()
  sport: Sport

  @OneToMany(() => Leaderboard, (leaderboard) => leaderboard.league, {
    cascade: ['remove'],
    onDelete: 'CASCADE'
  })
  leaderboards: Leaderboard[]

  @OneToOne(() => Leaderboard, {
    cascade: ['remove'],
    onDelete: 'CASCADE'
  })
  @JoinColumn()
  active_leaderboard: Leaderboard

  @Column()
  name: string

  @Column()
  description: string

  @ManyToMany(() => User, (user) => user.leagues, {
    cascade: ['remove'],
    onDelete: 'CASCADE'
  })
  @JoinTable()
  users: User[]

  @ManyToOne(() => Team, (team) => team.leagues, { nullable: true })
  team?: Team
}
