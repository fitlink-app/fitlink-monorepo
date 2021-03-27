import {
  PrimaryGeneratedColumn,
  Entity,
  OneToOne,
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
