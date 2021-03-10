import { PrimaryGeneratedColumn, Column, Entity, OneToOne } from 'typeorm'

import { CreatableEntity } from '../../../classes/entity/creatable'
import { User } from '../../users/entities/user.entity'

export enum PrivacySetting {
  Private = 'private',
  Followers = 'followers',
  Public = 'public'
}

@Entity()
export class UsersSetting extends CreatableEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  /**
   * Subscribed to newsletters relating to usage of the app
   * (e.g. tips/tricks for fitness)
   */
  @Column({
    default: false
  })
  newsletter_subscriptions_user: boolean

  /**
   * Subscribed to newsletters relating to usage of the platform
   * (e.g. HR materials)
   */
  @Column({
    default: false
  })
  newsletter_subscriptions_admin: boolean

  @Column({
    type: 'enum',
    enum: PrivacySetting
  })
  privacy_daily_statistics: PrivacySetting

  @Column({
    type: 'enum',
    enum: PrivacySetting
  })
  privacy_activities: PrivacySetting

  @OneToOne(() => User, (user) => user.settings)
  user: User
}
