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

export enum ActivityType {
  Class = 'class',
  Group = 'group',
  Route = 'route'
}

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

  @OneToOne(() => Image, { nullable: true })
  @JoinColumn()
  organizer_image?: Image

  @Column({ nullable: true })
  organizer_url: string

  @Column()
  meeting_point_text: string

  @Column({ type: 'geometry', spatialFeatureType: 'Point', srid: 4326 })
  meeting_point: Geometry

  @Column({
    type: 'enum',
    enum: ActivityType,
    default: ActivityType.Class
  })
  type: string

  @ManyToOne(() => Team, (team) => team.activities, { nullable: true })
  team?: Team

  @ManyToOne(() => League, { nullable: true })
  league?: League

  @OneToMany(() => Image, (image) => image.activity)
  images: Image[]
}
