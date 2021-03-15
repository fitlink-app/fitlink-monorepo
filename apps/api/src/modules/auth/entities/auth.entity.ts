import { PrimaryGeneratedColumn, Column, Entity, ManyToOne } from 'typeorm'

import { CreatableEntity } from '../../../classes/entity/creatable'
import { User } from '../../users/entities/user.entity'

@Entity()
export class RefreshToken extends CreatableEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => User, (user) => user.refresh_tokens)
  user: User

  @Column()
  token: string

  @Column({
    default: false
  })
  revoked: boolean

  @Column({
    nullable: true
  })
  revoked_at: Date
}
