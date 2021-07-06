import {
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToOne,
  Entity,
  JoinColumn,
  Column,
  OneToMany
} from 'typeorm'
import { CreatableEntity } from '../../../classes/entity/creatable'
import { Team } from '../../teams/entities/team.entity'
import { Organisation } from '../../organisations/entities/organisation.entity'
import { Image } from '../../images/entities/image.entity'
import { RewardsRedemption } from '../../rewards-redemptions/entities/rewards-redemption.entity'
import { ApiProperty } from '@nestjs/swagger'

export enum RewardAccess {
  Public = 'public',
  Team = 'team',
  Organisation = 'organisation'
}

export enum RewardPlatform {
  Fitlink = 'fitlink'
}

@Entity()
export class Reward extends CreatableEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string

  /** Team is not required in cases where the reward is public / organisation level reward */
  @ManyToOne(() => Team, (team) => team.rewards, { nullable: true })
  team: Team

  /** Organisation is not required in cases where the reward is public / team level reward */
  @ManyToOne(() => Organisation, (organisation) => organisation.rewards, {
    nullable: true
  })
  organisation: Organisation

  @Column()
  description: string

  @Column()
  name: string

  @Column()
  name_short: string

  @Column()
  code: string

  @Column({
    nullable: true
  })
  redeem_url: string

  @Column()
  brand: string

  @Column()
  points_required: number

  @Column({
    default: 0
  })
  redeemed_count: number

  @Column({
    default: 0
  })
  units_available: number

  @Column({
    default: false
  })
  limit_units: boolean

  @Column()
  reward_expires_at: Date

  @Column({
    enum: RewardPlatform,
    default: RewardPlatform.Fitlink
  })
  platform: RewardPlatform

  @Column({
    enum: RewardAccess,
    default: RewardAccess.Public
  })
  access: RewardAccess

  @OneToOne(() => Image, { nullable: true })
  @JoinColumn()
  image: Image

  @OneToMany(() => RewardsRedemption, (redemption) => redemption.reward)
  redemptions: RewardsRedemption[]
}

export class RewardPublic extends Reward {
  @ApiProperty()
  redeemed: boolean
}
