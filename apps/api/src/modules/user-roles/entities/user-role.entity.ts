import { PrimaryGeneratedColumn, Entity, ManyToOne, Column } from 'typeorm'
import { CreatableEntity } from '../../../classes/entity/creatable'
import { Organisation } from '../../organisations/entities/organisation.entity'
import { Subscription } from '../../subscriptions/entities/subscription.entity'
import { Team } from '../../teams/entities/team.entity'
import { User } from '../../users/entities/user.entity'

export enum Roles {
  OrganisationAdmin = 'organisation_admin',
  SubscriptionAdmin = 'subscription_admin',
  TeamAdmin = 'team_admin',
  SuperAdmin = 'super_admin',
  Self = 'self'
}

@Entity()
export class UserRole extends CreatableEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => User, (user) => user.roles)
  user: User

  @Column({
    enum: Roles
  })
  role: string

  @ManyToOne(() => Organisation)
  organisation: Organisation

  @ManyToOne(() => Team)
  team: Team

  @ManyToOne(() => Subscription)
  subscription: Subscription
}
