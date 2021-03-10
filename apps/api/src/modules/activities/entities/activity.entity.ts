import {
  PrimaryGeneratedColumn,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn
} from 'typeorm'

import { Geometry } from 'geojson'
import { Team } from '../../teams/entities/team.entity'
import { Image } from '../../images/entities/image.entity'
import { CreatableEntity } from '../../../classes/entity/creatable'
import { League } from '../../leagues/entities/league.entity'

@Entity()
export class Activity extends CreatableEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  url: string

  @OneToOne(() => League, { nullable: true })
  @JoinColumn()
  league: League

  @Column()
  date: string

  @Column({
    type: 'json'
  })
  keywords: string[]

  @Column()
  description: string

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point'
  })
  meeting_point: Geometry

  @Column()
  meeting_point_text: string

  @Column()
  archived: boolean

  @ManyToOne(() => Team, (team) => team.activities, { nullable: true })
  team: Team

  @OneToMany(() => Image, null, { nullable: true })
  images: Image[]
}
