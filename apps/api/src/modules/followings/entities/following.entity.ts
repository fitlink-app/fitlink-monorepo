import { PrimaryGeneratedColumn, ManyToOne, Entity, JoinColumn } from 'typeorm'
import { CreatableEntity } from '../../../classes/entity/creatable'
import { User } from '../../users/entities/user.entity'

@Entity()
export class Following extends CreatableEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => User, (user) => user.followers, {
    eager: true
  })
  @JoinColumn()
  follower: User

  @ManyToOne(() => User, (user) => user.following, {
    eager: true
  })
  @JoinColumn()
  following: User

}
