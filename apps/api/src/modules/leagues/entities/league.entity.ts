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
import { User, UserPublic } from '../../users/entities/user.entity'
import { Image } from '../../images/entities/image.entity'
import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'

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
  @Column({
    default: () => 'CURRENT_TIMESTAMP'
  })
  starts_at: Date

  @ApiProperty()
  @Column({
    default: () => "(CURRENT_TIMESTAMP + INTERVAL '1 day')"
  })
  ends_at: Date

  @ApiProperty()
  @ManyToOne(() => Sport, (sport) => sport.leagues)
  @JoinColumn()
  sport: Sport

  @OneToMany(() => Leaderboard, (leaderboard) => leaderboard.league)
  leaderboards: Leaderboard[]

  @OneToOne(() => Leaderboard)
  @JoinColumn()
  active_leaderboard: Leaderboard

  @ApiProperty({
    type: UserPublic
  })
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

  rank: number
}

export class LeaguePublic extends League {
  @ApiProperty()
  @Expose()
  participating: boolean

  @ApiProperty()
  @Expose()
  is_owner: boolean

  @ApiProperty()
  @Expose()
  rank: number
}

export class LeaguePublicPagination {
  @ApiProperty()
  page_total: number

  @ApiProperty()
  total: number

  @ApiProperty({
    type: LeaguePublic,
    isArray: true
  })
  results: LeaguePublic[]
}
