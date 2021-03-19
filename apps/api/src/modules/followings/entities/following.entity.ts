import { PrimaryGeneratedColumn, ManyToOne, Entity, JoinColumn, Column } from 'typeorm'
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

  @Column()
  followerId: string | null

  @ManyToOne(() => User, (user) => user.following, {
    eager: true
  })
  @JoinColumn()
  following: User

  @Column()
  followingId: string | null
}
