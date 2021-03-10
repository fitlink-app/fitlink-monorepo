import { CreatableEntity } from '../../../classes/entity/creatable'
import { PrimaryGeneratedColumn, Column, Entity, ManyToOne } from 'typeorm'

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

  @Column()
  current_calories: number

  @Column()
  target_calories: number

  @Column()
  current_steps: number

  @Column()
  target_steps: number

  @Column()
  current_floors_climbed: number

  @Column()
  target_floors_climbed: number

  @Column({
    type: 'float'
  })
  current_water_litres: number

  @Column({
    type: 'float'
  })
  target_water_litres: number

  @Column({
    type: 'float'
  })
  current_sleep_hours: number

  @Column({
    type: 'float'
  })
  target_sleep_hours: number

  @ManyToOne(() => User, (user) => user.goals_entries)
  user: User
}
