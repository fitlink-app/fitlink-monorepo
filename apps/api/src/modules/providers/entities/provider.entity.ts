import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import {
  PrimaryGeneratedColumn,
  ManyToOne,
  Entity,
  Column,
  OneToMany
} from 'typeorm'
import { CreatableEntity } from '../../../classes/entity/creatable'
import { HealthActivity } from '../../health-activities/entities/health-activity.entity'
import { User } from '../../users/entities/user.entity'
import { ProviderType } from '../providers.constants'

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

  /** Used when the token cannot be refreshed, to inform the user to re-authenticate */
  @Column({
    default: false
  })
  token_error: boolean

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

export class ProviderPublic {
  @ApiProperty()
  @Expose()
  id: string

  @ApiProperty()
  @Expose()
  type: string
}
