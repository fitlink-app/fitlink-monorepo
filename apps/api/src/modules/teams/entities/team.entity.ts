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
import { Reward } from '../../rewards/entities/reward.entity'
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

  @OneToMany(() => Activity, (activity) => activity.team, {
    cascade: ['remove'],
    onDelete: 'CASCADE'
  })
  activities: Activity[]

  @OneToMany(() => Reward, (reward) => reward.team, {
    cascade: ['remove'],
    onDelete: 'CASCADE'
  })
  rewards: Reward[]

  @OneToOne(() => Image, {
    nullable: true,
    cascade: ['remove'],
    onDelete: 'CASCADE'
  })
  @JoinColumn()
  avatar: Image

  @ManyToMany(() => User, (user) => user.teams, {
    cascade: ['remove'],
    onDelete: 'CASCADE'
  })
  @JoinTable()
  users: User[]

  @OneToMany(() => League, (league) => league.team, { nullable: true })
  leagues?: League[]
}
