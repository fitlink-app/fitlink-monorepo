import { PrimaryGeneratedColumn, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { CreatableEntity } from '../../../classes/entity/creatable'
import { User } from '../../users/entities/user.entity'
import { Reward } from '../../rewards/entities/reward.entity'

@Entity()
export class RewardsRedemption extends CreatableEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => User, (user) => user.rewards_redemptions)
  @JoinColumn()
  user: User

  @ManyToOne(() => Reward, (reward) => reward.redemptions)
  @JoinColumn()
  reward: Reward
}
