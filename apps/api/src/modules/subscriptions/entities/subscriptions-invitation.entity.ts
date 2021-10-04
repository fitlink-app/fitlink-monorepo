import {
  PrimaryGeneratedColumn,
  Entity,
  ManyToOne,
  JoinColumn,
  Column
} from 'typeorm'
import { CreatableEntity } from '../../../classes/entity/creatable'
import { User, UserPublic } from '../../users/entities/user.entity'
import { Subscription } from './subscription.entity'

@Entity()
export class SubscriptionsInvitation extends CreatableEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  email: string

  @Column({
    nullable: true
  })
  name: string

  /**
   * The user sending the invitation
   */
  @ManyToOne(() => User, (user) => user.subscriptions_invitations_sent)
  @JoinColumn()
  owner: User | UserPublic

  /**
   * After a user completes the invitation
   * it resolves here for reporting purposes
   */
  @ManyToOne(() => User, (user) => user.subscriptions_invitations)
  @JoinColumn()
  resolved_user: User

  @ManyToOne(() => Subscription, (subscription) => subscription.invitations)
  @JoinColumn()
  subscription: Subscription

  @Column({
    default: false
  })
  accepted: boolean

  @Column({
    default: false
  })
  dismissed: boolean
}
