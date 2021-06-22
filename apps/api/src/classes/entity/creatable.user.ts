import { ApiProperty } from '@nestjs/swagger'
import { ManyToOne } from 'typeorm'
import { User } from '../../modules/users/entities/user.entity'
import { CreatableEntity } from './creatable'

export abstract class CreatableByUserEntity extends CreatableEntity {}
