import { ApiProperty } from '@nestjs/swagger'
import { PrimaryGeneratedColumn, ManyToOne, Entity, JoinColumn } from 'typeorm'
import { CreatableEntity } from '../../../classes/entity/creatable'
import { User, UserPublic } from '../../users/entities/user.entity'

@Entity()
export class Following extends CreatableEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ApiProperty()
  @ManyToOne(() => User, (user) => user.followers, {
    eager: true
  })
  @JoinColumn()
  follower: User

  @ApiProperty()
  @ManyToOne(() => User, (user) => user.following, {
    eager: true
  })
  @JoinColumn()
  following: User
}
