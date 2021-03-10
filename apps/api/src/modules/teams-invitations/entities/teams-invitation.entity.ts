import {
  PrimaryGeneratedColumn,
  Entity,
  OneToOne,
  JoinColumn,
  Column
} from 'typeorm'
import { CreatableEntity } from '../../../classes/entity/creatable'
import { Team } from '../../teams/entities/team.entity'
import { User } from '../../users/entities/user.entity'

@Entity()
export class TeamsInvitation extends CreatableEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  /**
   * After a user completes the invitation
   * it resolves here for reporting purposes
   */
  @OneToOne(() => User, { nullable: true })
  @JoinColumn()
  resolved_user: User

  @OneToOne(() => Team)
  @JoinColumn()
  team: Team

  @Column({
    default: false
  })
  accepted: boolean

  @Column({
    default: false
  })
  dismissed: boolean
}
