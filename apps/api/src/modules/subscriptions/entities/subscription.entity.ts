import { ApiProperty } from '@nestjs/swagger'
import {
  PrimaryGeneratedColumn,
  Entity,
  ManyToOne,
  Column,
  OneToMany,
  JoinColumn
} from 'typeorm'
import { CreatableEntity } from '../../../classes/entity/creatable'
import { Organisation } from '../../organisations/entities/organisation.entity'
import { User } from '../../users/entities/user.entity'
import { BillingPlanStatus, SubscriptionType } from '../subscriptions.constants'

@Entity()
export class Subscription extends CreatableEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @OneToMany(() => User, (user) => user.subscription, {
    nullable: true
  })
  users: User[]

  @ManyToOne(() => Organisation, (organisation) => organisation.subscriptions, {
    nullable: true
  })
  @JoinColumn()
  organisation: Organisation

  @Column({
    nullable: true,
    default: ''
  })
  billing_first_name: string

  @Column({
    nullable: true,
    default: ''
  })
  billing_last_name: string

  @Column({
    nullable: true,
    default: ''
  })
  billing_entity: string

  @Column({
    nullable: true,
    default: ''
  })
  billing_address_1?: string

  @Column({
    nullable: true,
    default: ''
  })
  billing_address_2?: string

  @Column({
    nullable: true,
    default: ''
  })
  billing_country?: string

  @Column({
    nullable: true
  })
  billing_country_code?: string

  @Column({
    nullable: true,
    default: ''
  })
  billing_state?: string

  @Column({
    nullable: true,
    default: ''
  })
  billing_city?: string

  @Column({
    nullable: true,
    default: ''
  })
  billing_postcode?: string

  @Column({
    default: 'GBP'
  })
  billing_currency_code: string

  @Column({
    nullable: true
  })
  /** Used for chargebee */
  billing_plan_customer_id: string

  @Column({
    type: 'enum',
    nullable: true,
    enum: BillingPlanStatus
  })
  /** Used for chargebee */
  billing_plan_status: BillingPlanStatus

  @Column({
    nullable: true
  })
  /** Used for chargebee trials */
  billing_plan_trial_end_date: Date

  @Column({
    nullable: true
  })
  /** Used for chargebee */
  billing_plan_last_billed_month: string

  @Column({
    type: 'enum',
    enum: SubscriptionType,
    default: SubscriptionType.Trial14day
  })
  type: string

  @Column({
    default: false,
    type: 'boolean'
  })
  default: boolean

  @Column({
    default: () => 'CURRENT_TIMESTAMP'
  })
  subscription_starts_at: Date
}

export class SubscriptionPagination {
  @ApiProperty()
  page_total: number

  @ApiProperty()
  total: number

  @ApiProperty({
    type: Subscription,
    isArray: true
  })
  results: Subscription[]
}

export class SubscriptionUser {
  @ApiProperty()
  userId: string
}
