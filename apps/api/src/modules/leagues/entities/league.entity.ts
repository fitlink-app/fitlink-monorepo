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
import { CreatableEntity } from '../../../classes/entity/creatable'
import { Leaderboard } from '../../leaderboards/entities/leaderboard.entity'
import { Sport } from '../../sports/entities/sport.entity'
import { Team } from '../../teams/entities/team.entity'
import { Organisation } from '../../organisations/entities/organisation.entity'
import { User } from '../../users/entities/user.entity'
import { Image } from '../../images/entities/image.entity'

export enum LeagueAccess {
  Private = 'private',
  Public = 'public',
  Team = 'team',
  Organisation = 'organisation'
}

export enum LeagueInvitePermission {
  Owner = 'owner',
  Participant = 'participant'
}

@Entity()
export class League extends CreatableEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => Sport, (sport) => sport.leagues)
  @JoinColumn()
  sport: Sport

  @OneToMany(() => Leaderboard, (leaderboard) => leaderboard.league)
  leaderboards: Leaderboard[]

  @OneToOne(() => Leaderboard)
  @JoinColumn()
  active_leaderboard: Leaderboard

  @ManyToOne(() => User, (user) => user.owned_leagues)
  owner: User

  @OneToOne(() => Image, { nullable: true })
  @JoinColumn()
  image: Image

  @ManyToMany(() => User, (user) => user.leagues)
  @JoinTable()
  users: User[]

  @ManyToOne(() => Team, (team) => team.leagues)
  team?: Team

  @ManyToOne(() => Organisation, (organisation) => organisation.leagues)
  organisation?: Organisation

  @Column()
  name: string

  @Column()
  description: string

  @Column({
    default: 1
  })
  duration: number

  @Column({
    default: false
  })
  repeat: boolean

  @Column({
    enum: LeagueAccess,
    default: LeagueAccess.Private
  })
  access: LeagueAccess

  @Column({
    enum: LeagueInvitePermission,
    default: LeagueInvitePermission.Participant
  })
  invite_permission: LeagueInvitePermission
}
