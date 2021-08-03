import { ApiProperty } from '@nestjs/swagger'
import {
  PrimaryGeneratedColumn,
  Entity,
  JoinColumn,
  Column,
  ManyToOne
} from 'typeorm'
import { CreatableEntity } from '../../../classes/entity/creatable'
import { League } from '../../leagues/entities/league.entity'
import { User, UserPublic } from '../../users/entities/user.entity'

@Entity()
export class LeaguesInvitation extends CreatableEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ApiProperty()
  @ManyToOne(() => User, (user) => user.leagues_invitations)
  @JoinColumn()
  to_user: User | UserPublic

  @ApiProperty()
  @ManyToOne(() => User)
  @JoinColumn()
  from_user: User | UserPublic

  @ApiProperty()
  @ManyToOne(() => League, (league) => league.invitations)
  @JoinColumn()
  league: League

  @ApiProperty()
  @Column({
    default: false
  })
  accepted: boolean

  @ApiProperty()
  @Column({
    default: false
  })
  dismissed: boolean
}

export class LeagueInvitationPagination {
  @ApiProperty()
  page_total: number

  @ApiProperty()
  total: number

  @ApiProperty({
    type: LeaguesInvitation,
    isArray: true
  })
  results: LeaguesInvitation[]
}
