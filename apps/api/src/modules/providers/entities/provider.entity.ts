import {
  PrimaryGeneratedColumn,
  ManyToOne,
  Entity,
  Column,
  OneToMany
} from 'typeorm'
import { CreatableEntity } from '../../../classes/entity/creatable'
import { HealthActivityDto } from '../../health-activities/dto/create-health-activity.dto'
import { healthActivityType } from '../../health-activities/dto/healthActivityType'
import { HealthActivity } from '../../health-activities/entities/health-activity.entity'
import { HealthActivitiesService } from '../../health-activities/health-activities.service'
import { User } from '../../users/entities/user.entity'

export enum ProviderType {
  Strava = 'strava',
  Fitbit = 'fitbit',
  GoogleFit = 'google_fit',
  AppleHealthkit = 'apple_healthkit'
}

@Entity()
export class Provider extends CreatableEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({
    type: 'enum',
    enum: ProviderType
  })
  type: string

  @ManyToOne(() => User, (user) => user.providers)
  user: User

  @Column({
    nullable: true
  })
  refresh_token: string

  @Column({
    nullable: true
  })
  token: string

  @Column({
    nullable: true
  })
  token_expires_at: Date

  @Column({
    type: 'json',
    nullable: true
  })
  scopes: string[]

  /** External id from the service to map the user if required */
  @Column({
    nullable: true
  })
  provider_user_id: string

  @OneToMany(
    () => HealthActivity,
    (healthActivity) => healthActivity.provider,
    { nullable: true }
  )
  health_activities: HealthActivity[]
}
