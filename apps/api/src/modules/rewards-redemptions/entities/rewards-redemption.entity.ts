import { PrimaryGeneratedColumn, OneToOne, Entity, JoinColumn } from 'typeorm'
import { CreatableEntity } from '../../../classes/entity/creatable'
import { User } from '../../users/entities/user.entity'
import { Reward } from '../../rewards/entities/reward.entity'

@Entity()
export class RewardsRedemption extends CreatableEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @OneToOne(() => User)
  @JoinColumn()
  user: User

  @OneToOne(() => Reward)
  @JoinColumn()
  reward: Reward
}
