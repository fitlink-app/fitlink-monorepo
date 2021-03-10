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

  @OneToMany(() => Team, (team) => team.organisation)
  teams: Team[]

  @Column()
  name: string

  @Column()
  billing_address_1: string

  @Column()
  billing_address_2: string

  @Column()
  billing_country: string

  @Column()
  billing_country_code: string

  @Column()
  billing_state: string

  @Column()
  billing_city: string

  @Column({
    type: 'enum',
    enum: OrganisationType
  })
  type: string

  @Column()
  type_other?: string

  @Column({
    default: 'Etc/UTC'
  })
  timezone: string

  @Column({
    default: 0
  })
  user_count: number

  @OneToOne(() => Image)
  @JoinColumn()
  avatar: Image //128x128

  @OneToOne(() => Image)
  @JoinColumn()
  avatar_large: Image //512x512
}
