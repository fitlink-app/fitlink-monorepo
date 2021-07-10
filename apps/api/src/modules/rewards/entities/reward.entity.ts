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
  @ApiProperty()
  @ManyToOne(() => Team, (team) => team.rewards, { nullable: true })
  team: Team

  /** Organisation is not required in cases where the reward is public / team level reward */
  @ApiProperty()
  @ManyToOne(() => Organisation, (organisation) => organisation.rewards, {
    nullable: true
  })
  organisation: Organisation

  @ApiProperty()
  @Column()
  description: string

  @ApiProperty()
  @Column()
  name: string

  @ApiProperty()
  @Column()
  name_short: string

  @ApiProperty()
  @Column()
  code: string

  @ApiProperty()
  @Column({
    nullable: true
  })
  redeem_url: string

  @ApiProperty()
  @Column()
  brand: string

  @ApiProperty()
  @Column()
  points_required: number

  @ApiProperty()
  @Column({
    default: 0
  })
  redeemed_count: number

  @ApiProperty()
  @Column({
    nullable: true
  })
  redeem_instructions: string

  @ApiProperty()
  @Column({
    default: 0
  })
  units_available: number

  @ApiProperty()
  @Column({
    default: false
  })
  limit_units: boolean

  @ApiProperty()
  @Column()
  reward_expires_at: Date

  @ApiProperty()
  @Column({
    enum: RewardPlatform,
    default: RewardPlatform.Fitlink
  })
  platform: RewardPlatform

  @ApiProperty()
  @Column({
    enum: RewardAccess,
    default: RewardAccess.Public
  })
  access: RewardAccess

  @ApiProperty()
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

export class RewardPublicPagination {
  @ApiProperty()
  page_total: number

  @ApiProperty()
  total: number

  @ApiProperty({
    type: RewardPublic,
    isArray: true
  })
  results: RewardPublic[]
}
