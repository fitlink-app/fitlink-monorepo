import { ApiProperty } from '@nestjs/swagger'
import {
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable
} from 'typeorm'

import { Activity } from '../../activities/entities/activity.entity'
import { Image } from '../../images/entities/image.entity'
import { League } from '../../leagues/entities/league.entity'
import { Organisation } from '../../organisations/entities/organisation.entity'
import { Page } from '../../pages/entities/page.entity'
import { Reward } from '../../rewards/entities/reward.entity'
import { TeamsInvitation } from '../../teams-invitations/entities/teams-invitation.entity'
import { User } from '../../users/entities/user.entity'

@Entity()
export class Team {
  @CreateDateColumn()
  created_at: Date

  @UpdateDateColumn()
  updated_at: Date

  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  name: string

  @ManyToOne(() => Organisation, (organisation) => organisation.teams)
  organisation: Organisation

  @OneToMany(() => Activity, (activity) => activity.team)
  activities: Activity[]

  @OneToMany(() => TeamsInvitation, (invitation) => invitation.team)
  invitations: TeamsInvitation[]

  @OneToMany(() => Reward, (reward) => reward.team)
  rewards: Reward[]

  @OneToOne(() => Image, {
    nullable: true
  })
  @JoinColumn()
  avatar: Image

  @ManyToMany(() => User, (user) => user.teams)
  @JoinTable()
  users: User[]

  @OneToMany(() => League, (league) => league.team, { nullable: true })
  leagues?: League[]

  @ApiProperty()
  @Column({
    default: 0
  })
  user_count: number

  @ApiProperty()
  @Column({
    nullable: true,
    unique: true
  })
  join_code: string

  @ApiProperty()
  @OneToOne(() => Page, (page) => page.team, {
    nullable: true
  })
  page: Page
}
