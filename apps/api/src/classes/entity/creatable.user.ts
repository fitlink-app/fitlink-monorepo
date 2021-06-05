import { ApiProperty } from '@nestjs/swagger'
import { User } from '../../modules/users/entities/user.entity'
import { CreatableEntity } from './creatable'

export abstract class CreatableByUserEntity extends CreatableEntity {
  @ApiProperty()
  created_by: User
}
