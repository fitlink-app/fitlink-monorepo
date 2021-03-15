import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Entity,
  OneToMany,
  Column,
  OneToOne,
  JoinColumn
} from 'typeorm'

import { Team } from '../../teams/entities/team.entity'
import { Image } from '../../images/entities/image.entity'

export enum OrganisationType {
  Company = 'company',
  Government = 'government',
  School = 'school',
  Institution = 'institution',
  Other = 'other'
}

@Entity()
export class Organisation {
  @CreateDateColumn()
  created_at: Date

  @UpdateDateColumn()
  updated_at: Date

  @PrimaryGeneratedColumn('uuid')
  id: string

  @OneToMany(() => Team, (team) => team.organisation, {
    cascade: ['remove'],
    onDelete: 'CASCADE'
  })
  teams: Team[]

  @Column()
  name: string

  @Column({
    nullable: true
  })
  billing_address_1?: string

  @Column({
    nullable: true
  })
  billing_address_2?: string

  @Column({
    nullable: true
  })
  billing_country?: string

  @Column({
    nullable: true
  })
  billing_country_code?: string

  @Column({
    nullable: true
  })
  billing_state?: string

  @Column()
  billing_city?: string

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

  @OneToOne(() => Image, {
    cascade: ['remove']
  })
  @JoinColumn()
  avatar_large: Image //512x512
}
