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
import { Image } from '../../images/entities/image.entity'
import { RewardsRedemption } from '../../rewards-redemptions/entities/rewards-redemption.entity'

@Entity()
export class Reward extends CreatableEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  /** Team is not required in cases where the reward is public */
  @ManyToOne(() => Team, (team) => team.rewards, { nullable: true })
  team: Team

  @Column()
  description: string

  @Column()
  name: string

  @Column()
  name_short: string

  @Column()
  code: string

  @Column()
  redeem_url: string

  @Column()
  brand: string

  @Column()
  points_required: number

  @Column()
  redeemed_count: number

  @Column()
  reward_expires_at: Date

  @Column()
  public: boolean

  @OneToOne(() => Image)
  @JoinColumn()
  image: Image

  @OneToMany(() => RewardsRedemption, (redemption) => redemption.reward)
  redemptions: RewardsRedemption[]
}
