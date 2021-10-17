import { CreatableEntity } from '../../../classes/entity/creatable'
import {
  PrimaryGeneratedColumn,
  Column,
  Entity,
  ManyToOne,
  JoinColumn,
  CreateDateColumn
} from 'typeorm'
import { User } from '../../users/entities/user.entity'
import { ApiProperty } from '@nestjs/swagger'
import { FeedItem } from '../../feed-items/entities/feed-item.entity'

@Entity()
export class GoalsEntry extends CreatableEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ApiProperty()
  @Column({
    nullable: true
  })
  notified_at: Date

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

  @ManyToOne(() => User, (user) => user.goals_entries)
  @JoinColumn()
  user: User

  @ManyToOne(() => FeedItem, (item) => item.goal_entry)
  feed_items: FeedItem
}

export class GoalsEntryCurrent {
  current_mindfulness_minutes?: number
  current_steps?: number
  current_floors_climbed?: number
  current_water_litres?: number
  current_sleep_hours?: number
}

export class GoalsEntryTarget {
  target_mindfulness_minutes: number
  target_steps: number
  target_floors_climbed: number
  target_water_litres: number
  target_sleep_hours: number
}
