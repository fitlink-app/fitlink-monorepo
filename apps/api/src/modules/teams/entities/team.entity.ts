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
  ManyToMany
} from 'typeorm'

import { Activity } from '../../activities/entities/activity.entity'
import { Image } from '../../images/entities/image.entity'
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

  @OneToMany(() => Activity, (activity) => activity.team)
  activities: Activity[]

  @OneToMany(() => Reward, (reward) => reward.team)
  rewards: Reward[]

  @OneToOne(() => Image, { nullable: true })
  @JoinColumn()
  avatar: Image

  @ManyToMany(() => User, (user) => user.teams)
  users: User[]
}
