import {
  PrimaryGeneratedColumn,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
  Index
} from 'typeorm'

import { Geometry } from 'geojson'
import { Team } from '../../teams/entities/team.entity'
import { Image } from '../../images/entities/image.entity'
import { CreatableEntity } from '../../../classes/entity/creatable'
import { League } from '../../leagues/entities/league.entity'
import { User } from '../../users/entities/user.entity'

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

  /** Legacy user_id for Firebase */
  @Column({
    nullable: true
  })
  user_id: string

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

  @Column({ nullable: true })
  organizer_telephone: string

  @Column({ nullable: true })
  organizer_email: string

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

  @Column({
    type: 'tsvector',
    nullable: true
  })
  @Index('activity_tsv_index', { synchronize: false })
  tsv?: string

  @ManyToOne(() => User, (user) => user.activities, { nullable: true })
  user?: User

  @ManyToOne(() => Team, (team) => team.activities, { nullable: true })
  team?: Team

  @ManyToOne(() => League, { nullable: true })
  league?: League

  @OneToMany(() => Image, (image) => image.activity)
  images: Image[]
}
