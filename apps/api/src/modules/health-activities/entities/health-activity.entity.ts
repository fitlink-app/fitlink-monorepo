import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn
} from 'typeorm'
import { CreatableEntity } from '../../../classes/entity/creatable'
import { FeedItem } from '../../feed-items/entities/feed-item.entity'
import { Image } from '../../images/entities/image.entity'
import { Provider } from '../../providers/entities/provider.entity'
import { Sport } from '../../sports/entities/sport.entity'
import { User } from '../../users/entities/user.entity'
import { HealthActivityDebug } from './health-activity-debug.entity'

@Entity()
export class HealthActivity extends CreatableEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => User, (user) => user.health_activities)
  user: User

  @OneToMany(() => Image, (image) => image.health_activity)
  images: Image[]

  @ManyToOne(() => Sport, (sport) => sport.health_activities)
  sport: Sport

  @ManyToOne(() => Provider, (provider) => provider.health_activities, {
    createForeignKeyConstraints: false
  })
  provider: Provider

  @ManyToOne(() => FeedItem, (item) => item.health_activity)
  feed_items: FeedItem[]

  /** Activity title, e.g. Afternoon Run, Morning Walk */
  @Column({
    default: 'Activity'
  })
  title: string

  @Column()
  points: number

  @Column({ type: 'float', default: 0 })
  calories: number

  @Column({
    type: 'float',
    nullable: true
  })
  elevation: number

  /** The start time of the activity, used for time-based activities like mindfulness */
  @Column()
  start_time: Date

  /** The end time of the activity, used for time-based activities like mindfulness */
  @Column()
  end_time: Date

  /** Active duration of an activity in seconds, if available. It does account for pauses or breaks */
  @Column({ nullable: true })
  active_time: number

  @Column({ nullable: true, type: 'float' })
  distance: number

  @Column({ nullable: true, type: 'float' })
  quantity: number

  @Column({ nullable: true })
  stairs: number

  @Column({ nullable: true, type: 'text' })
  polyline: string

  @Column({ default: false })
  distributed: boolean

  @OneToOne(() => HealthActivityDebug, (debug) => debug.health_activity, {
    nullable: true
  })
  debug: HealthActivityDebug
}
