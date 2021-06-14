import { CreatableEntity } from '../../../classes/entity/creatable'
import {
  PrimaryGeneratedColumn,
  Column,
  Entity,
  ManyToOne,
  JoinColumn
} from 'typeorm'
import { User } from '../../users/entities/user.entity'
import { ApiProperty } from '@nestjs/swagger'

@Entity()
export class GoalsEntry extends CreatableEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string

  /** The year */
  @ApiProperty()
  @Column()
  year: number

  /** The day for the user in their timezone (1 out of 365) */
  @ApiProperty()
  @Column()
  day: number

  @ApiProperty()
  @Column({
    default: 0
  })
  current_mindfulness_minutes: number

  @ApiProperty()
  @Column({
    default: 0
  })
  target_mindfulness_minutes: number

  @ApiProperty()
  @Column({
    default: 0
  })
  current_steps: number

  @ApiProperty()
  @Column({
    default: 0
  })
  target_steps: number

  @ApiProperty()
  @Column({
    default: 0
  })
  current_floors_climbed: number

  @ApiProperty()
  @Column({
    default: 0
  })
  target_floors_climbed: number

  @ApiProperty()
  @Column({
    type: 'float',
    default: 0
  })
  current_water_litres: number

  @ApiProperty()
  @Column({
    type: 'float',
    default: 0
  })
  target_water_litres: number

  @ApiProperty()
  @Column({
    type: 'float',
    default: 0
  })
  current_sleep_hours: number

  @ApiProperty()
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
