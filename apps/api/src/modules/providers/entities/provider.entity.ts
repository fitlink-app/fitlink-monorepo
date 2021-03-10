import { PrimaryGeneratedColumn, ManyToOne, Entity, Column } from 'typeorm'
import { CreatableEntity } from '../../../classes/entity/creatable'
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

  @Column()
  refresh_token: string

  @Column()
  token: string

  @Column()
  token_expires_at: Date

  @Column({
    type: 'json'
  })
  scopes: string[]

  /** External id from the service to map the user if required */
  @Column()
  provider_user_id: string
}
