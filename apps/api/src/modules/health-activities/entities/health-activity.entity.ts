import {
  PrimaryGeneratedColumn,
  Entity,
  ManyToOne,
  OneToOne,
  JoinColumn,
  Column
} from 'typeorm'

import { Image } from '../../images/entities/image.entity'
import { CreatableEntity } from '../../../classes/entity/creatable'
import { User } from '../../users/entities/user.entity'
import { Sport } from '../../sports/entities/sport.entity'
import { Provider } from '../../providers/entities/provider.entity'

@Entity()
export class HealthActivity extends CreatableEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => User, (user) => user.health_activities)
  user: User

  @OneToOne(() => Image, { nullable: true })
  @JoinColumn()
  image: Image

  @OneToOne(() => Sport)
  @JoinColumn()
  sport: Sport

  @OneToOne(() => Provider)
  @JoinColumn()
  provider: Provider

  @Column()
  points: number

  @Column()
  calories: number

  @Column({
    type: 'float'
  })
  elevation: number

  @Column()
  start_at: Date

  @Column()
  end_at: Date
}
