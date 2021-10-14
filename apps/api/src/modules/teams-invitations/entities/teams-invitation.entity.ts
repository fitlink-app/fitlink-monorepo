import {
  PrimaryGeneratedColumn,
  Entity,
  ManyToOne,
  JoinColumn,
  Column
} from 'typeorm'
import { CreatableEntity } from '../../../classes/entity/creatable'
import { Team } from '../../teams/entities/team.entity'
import { User, UserPublic } from '../../users/entities/user.entity'

@Entity()
export class TeamsInvitation extends CreatableEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  email: string

  @Column({
    nullable: true
  })
  name: string

  /**
   * Optionally adds an admin flag to the invitation
   * for redeeming administration of a team.
   */
  @Column({
    default: false
  })
  admin: boolean

  /**
   * The user sending the invitation
   */
  @ManyToOne(() => User, (user) => user.teams_invitations_sent)
  @JoinColumn()
  owner: User | UserPublic

  /**
   * After a user completes the invitation
   * it resolves here for reporting purposes
   */
  @ManyToOne(() => User, (user) => user.teams_invitations)
  @JoinColumn()
  resolved_user: User

  @ManyToOne(() => Team, (team) => team.invitations)
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
