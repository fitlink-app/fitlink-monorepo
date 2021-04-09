import { CreatableEntity } from '../../../classes/entity/creatable'
import {
  PrimaryGeneratedColumn,
  Column,
  Entity,
  ManyToOne,
  JoinColumn
} from 'typeorm'
import { User } from '../../users/entities/user.entity'

@Entity()
export class GoalsEntry extends CreatableEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  /** The year */
  @Column()
  year: number

  /** The day for the user in their timezone (1 out of 365) */
  @Column()
  day: number

  @Column({
    default: 0
  })
  current_calories: number

  @Column({
    default: 0
  })
  target_calories: number

  @Column({
    default: 0
  })
  current_steps: number

  @Column({
    default: 0
  })
  target_steps: number

  @Column({
    default: 0
  })
  current_floors_climbed: number

  @Column({
    default: 0
  })
  target_floors_climbed: number

  @Column({
    type: 'float',
    default: 0
  })
  current_water_litres: number

  @Column({
    type: 'float',
    default: 0
  })
  target_water_litres: number

  @Column({
    type: 'float',
    default: 0
  })
  current_sleep_hours: number

  @Column({
    type: 'float',
    default: 0
  })
  target_sleep_hours: number

  @ManyToOne(() => User, (user) => user.goals_entries, {
    eager: true
  })
  @JoinColumn()
  user: User
}
