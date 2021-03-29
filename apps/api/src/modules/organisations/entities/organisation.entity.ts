import {
  PrimaryGeneratedColumn,
  Entity,
  OneToMany,
  Column,
  OneToOne,
  JoinColumn
} from 'typeorm'

import { CreatableEntity } from '../../../classes/entity/creatable'
import { Team } from '../../teams/entities/team.entity'
import { Image } from '../../images/entities/image.entity'
import { Subscription } from '../../subscriptions/entities/subscription.entity'
import { OrganisationsInvitation } from '../../organisations-invitations/entities/organisations-invitation.entity'

export enum OrganisationType {
  Company = 'company',
  Government = 'government',
  School = 'school',
  Institution = 'institution',
  Other = 'other'
}

@Entity()
export class Organisation extends CreatableEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @OneToMany(() => Team, (team) => team.organisation, {
    cascade: ['remove'],
    onDelete: 'CASCADE'
  })
  teams: Team[]

  @OneToMany(() => Subscription, (subscription) => subscription.organisation, {
    cascade: ['remove'],
    onDelete: 'CASCADE'
  })
  subscriptions: Subscription[]

  @OneToMany(
    () => OrganisationsInvitation,
    (invitation) => invitation.organisation,
    {
      cascade: ['remove'],
      onDelete: 'CASCADE'
    }
  )
  invitations: OrganisationsInvitation[]

  @Column()
  name: string

  @Column({
    type: 'enum',
    enum: OrganisationType,
    default: OrganisationType.Company
  })
  type: string

  @Column({
    nullable: true
  })
  type_other?: string

  @Column({
    default: 'Etc/UTC'
  })
  timezone: string

  @Column({
    default: 0
  })
  user_count: number

  @OneToOne(() => Image, {
    cascade: ['remove'],
    onDelete: 'CASCADE'
  })
  @JoinColumn()
  avatar: Image //128x128
}
