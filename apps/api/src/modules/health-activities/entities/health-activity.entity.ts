import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn
} from 'typeorm'
import { CreatableEntity } from '../../../classes/entity/creatable'
import { Image } from '../../images/entities/image.entity'
import { Provider } from '../../providers/entities/provider.entity'
import { Sport } from '../../sports/entities/sport.entity'
import { User } from '../../users/entities/user.entity'

@Entity()
export class HealthActivity extends CreatableEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => User, (user) => user.health_activities)
  user: User

  @OneToMany(() => Image, (image) => image.health_activity, { nullable: true })
  images: Image

  @ManyToOne(() => Sport, (sport) => sport.health_activities)
  sport: Sport

  @ManyToOne(() => Provider, (provider) => provider.health_activities)
  provider: Provider

  @Column()
  points: number

  @Column({ type: 'float' })
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

  @Column({ nullable: true })
  quantity: number

  @Column({ nullable: true })
  stairs: number

  @Column({ type: 'text', nullable: true })
  polyline: string

  @Column({ default: false })
  distributed: boolean
}
