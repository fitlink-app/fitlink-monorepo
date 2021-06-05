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
import { ApiProperty } from '@nestjs/swagger'

export enum OrganisationType {
  Company = 'company',
  Government = 'government',
  School = 'school',
  Institution = 'institution',
  Other = 'other'
}

@Entity()
export class Organisation extends CreatableEntity {
  @ApiProperty()
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

  @ApiProperty()
  @Column()
  name: string

  @ApiProperty()
  @Column({
    type: 'enum',
    enum: OrganisationType,
    default: OrganisationType.Company
  })
  type: string

  @ApiProperty()
  @Column({
    nullable: true
  })
  type_other?: string

  @ApiProperty()
  @Column({
    default: 'Etc/UTC'
  })
  timezone: string

  @ApiProperty()
  @Column({
    default: 0
  })
  user_count: number

  @ApiProperty()
  @OneToOne(() => Image, {
    cascade: ['remove'],
    onDelete: 'CASCADE'
  })
  @JoinColumn()
  avatar: Image //128x128
}
