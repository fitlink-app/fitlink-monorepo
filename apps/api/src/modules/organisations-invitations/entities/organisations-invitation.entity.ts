import {
  PrimaryGeneratedColumn,
  Entity,
  OneToOne,
  JoinColumn,
  Column
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

  /**
   * After a user completes the invitation
   * it resolves here for reporting purposes
   */
  @OneToOne(() => User, { nullable: true })
  @JoinColumn()
  resolved_user: User

  @OneToOne(() => Organisation)
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
