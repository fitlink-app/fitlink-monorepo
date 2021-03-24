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
  name: string

  @Column()
  description: string

  @Column()
  date: string

  @Column({ nullable: true })
  cost: string

  @Column({ nullable: true })
  organizer_name: string

  @Column({ nullable: true })
  organizer_url: string

  @Column()
  meeting_point_text: string

  @Column({ type: 'geometry', spatialFeatureType: 'Point', srid: 4326 })
  meeting_point: Geometry

  @ManyToOne(() => Team, (team) => team.activities, { nullable: true })
  team?: Team

  @OneToOne(() => League, { nullable: true })
  @JoinColumn()
  league?: League

  @OneToMany(() => Image, null, { nullable: true })
  images: Image[]
}
