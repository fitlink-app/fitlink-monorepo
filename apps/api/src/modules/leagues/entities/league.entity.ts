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
import { ApiProperty } from '@nestjs/swagger'

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
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ApiProperty()
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

  @ApiProperty()
  @OneToOne(() => Image, { nullable: true })
  @JoinColumn()
  image: Image

  @ManyToMany(() => User, (user) => user.leagues)
  @JoinTable()
  users: User[]

  @ApiProperty()
  @ManyToOne(() => Team, (team) => team.leagues)
  team?: Team

  @ApiProperty()
  @ManyToOne(() => Organisation, (organisation) => organisation.leagues)
  organisation?: Organisation

  @ApiProperty()
  @Column()
  name: string

  @ApiProperty()
  @Column()
  description: string

  @ApiProperty()
  @Column({
    default: 1
  })
  duration: number

  @ApiProperty()
  @Column({
    default: false
  })
  repeat: boolean

  @ApiProperty()
  @Column({
    enum: LeagueAccess,
    default: LeagueAccess.Private
  })
  access: LeagueAccess

  @ApiProperty()
  @Column({
    enum: LeagueInvitePermission,
    default: LeagueInvitePermission.Participant
  })
  invite_permission: LeagueInvitePermission

  @ApiProperty()
  @Column({
    default: 0
  })
  participants_total: number
}
