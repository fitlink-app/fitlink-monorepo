import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn
} from 'typeorm'
import { CreatableEntity } from '../../../classes/entity/creatable'
import { User } from '../../users/entities/user.entity'
import { HealthActivity } from './health-activity.entity'

/**
 * Used to store raw health activities for debugging
 * issues later.
 */

@Entity()
export class HealthActivityDebug extends CreatableEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @OneToOne(() => HealthActivity, (activity) => activity.debug, {
    nullable: true
  })
  @JoinColumn()
  health_activity: HealthActivity

  @ManyToOne(() => User, (user) => user.health_activities_debug, {
    nullable: true
  })
  user: User

  @Column({
    default: '{}',
    type: 'json'
  })
  processed: NodeJS.Dict<any>

  @Column({
    default: '{}',
    type: 'json'
  })
  raw: NodeJS.Dict<any>

  @Column({
    default: '[]',
    type: 'json'
  })
  log: string[]
}
