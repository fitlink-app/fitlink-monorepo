import {
  PrimaryGeneratedColumn,
  Entity,
  JoinColumn,
  Column,
  ManyToOne
} from 'typeorm'
import { CreatableEntity } from '../../../classes/entity/creatable'
import { Organisation } from '../../organisations/entities/organisation.entity'
import { User } from '../../users/entities/user.entity'

@Entity()
export class OrganisationsInvitation extends CreatableEntity {
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
   * for redeeming administration of an organisation.
   */
  @Column({
    default: false
  })
  admin: boolean

  /**
   * The user sending the invitation
   */
  @ManyToOne(() => User, (user) => user.organisations_invitations_sent)
  @JoinColumn()
  owner: User

  /**
   * After a user completes the invitation
   * it resolves here for reporting purposes
   */
  @ManyToOne(() => User, (user) => user.organisations_invitations)
  @JoinColumn()
  resolved_user: User

  @ManyToOne(() => Organisation, (organisation) => organisation.invitations)
  @JoinColumn()
  organisation: Organisation

  @Column({
    default: false
  })
  accepted: boolean

  @Column({
    default: false
  })
  dismissed: boolean
}
