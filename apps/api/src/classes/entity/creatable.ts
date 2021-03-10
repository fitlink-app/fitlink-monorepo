import { CreateDateColumn, UpdateDateColumn } from 'typeorm'

import { User } from '../../modules/users/entities/user.entity'

export abstract class CreatableEntity {
  @CreateDateColumn()
  created_at: Date

  @UpdateDateColumn()
  updated_at: Date
}

export abstract class CreatableByUserEntity extends CreatableEntity {
  created_by: User
}
