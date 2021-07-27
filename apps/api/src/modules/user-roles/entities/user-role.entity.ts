import { ApiProperty } from '@nestjs/swagger'
import { PrimaryGeneratedColumn, Entity, ManyToOne, Column } from 'typeorm'
import { CreatableEntity } from '../../../classes/entity/creatable'
import { Organisation } from '../../organisations/entities/organisation.entity'
import { Subscription } from '../../subscriptions/entities/subscription.entity'
import { Team } from '../../teams/entities/team.entity'
import { User } from '../../users/entities/user.entity'
import { Roles } from '../user-roles.constants'

@Entity()
export class UserRole extends CreatableEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => User, (user) => user.roles)
  user: User

  @ApiProperty({
    enum: Roles
  })
  @Column({
    type: 'enum',
    enum: Roles
  })
  role: Roles

  @ApiProperty()
  @ManyToOne(() => Organisation)
  organisation: Organisation

  @ApiProperty()
  @ManyToOne(() => Team)
  team: Team

  @ApiProperty()
  @ManyToOne(() => Subscription)
  subscription: Subscription
}
