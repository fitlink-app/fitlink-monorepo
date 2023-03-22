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
import { CreatableEntity } from '../../../classes/entity/creatable'

@Entity()
export class LeagueWaitlistUser extends CreatableEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  league_id: string

  @Column()
  user_id: string
}
