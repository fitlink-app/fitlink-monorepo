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

export enum SubscriptionType {
  Trial30day = 'Trial30day',
  Trial90day = 'Trial90day',
  Dynamic = 'dynamic'
}

@Entity()
export class Subscription extends CreatableEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @OneToMany(() => User, (user) => user.subscription, {
    nullable: true
  })
  users: User[];


  @ManyToOne(() => Organisation, (organisation) => organisation.subscriptions, {
    nullable: true
  })
  @JoinColumn()
  organisation: Organisation

  @Column()
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
    type: 'enum',
    enum: SubscriptionType,
    default: SubscriptionType.Trial30day
  })
  type: string

  @Column({
    default: false,
    type: 'boolean'
  })
  default: boolean
}
