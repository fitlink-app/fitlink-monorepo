import { ApiProperty } from '@nestjs/swagger'
import { PrimaryGeneratedColumn, Column, Entity, OneToOne } from 'typeorm'

import { CreatableEntity } from '../../../classes/entity/creatable'
import { User } from '../../users/entities/user.entity'

export enum PrivacySetting {
  /** Only the self-user can see this */
  Private = 'private',

  /** Only the people the user follows can see this */
  Following = 'following',

  /** Anyone can see this */
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
  @ApiProperty()
  @Column({
    default: false
  })
  newsletter_subscriptions_user: boolean

  /**
   * Subscribed to newsletters relating to usage of the platform
   * (e.g. HR materials)
   */
  @ApiProperty()
  @Column({
    default: false
  })
  newsletter_subscriptions_admin: boolean

  @ApiProperty({
    enum: PrivacySetting
  })
  @Column({
    type: 'enum',
    enum: PrivacySetting,
    default: PrivacySetting.Public
  })
  privacy_daily_statistics: PrivacySetting

  @ApiProperty({
    enum: PrivacySetting
  })
  @Column({
    type: 'enum',
    enum: PrivacySetting,
    default: PrivacySetting.Public
  })
  privacy_activities: PrivacySetting

  @OneToOne(() => User, (user) => user.settings)
  user: User
}
