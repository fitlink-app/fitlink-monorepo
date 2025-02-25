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

import { Geometry, Point } from 'geojson'
import { Team } from '../../teams/entities/team.entity'
import { Image } from '../../images/entities/image.entity'
import { CreatableEntity } from '../../../classes/entity/creatable'
import { League } from '../../leagues/entities/league.entity'
import { User, UserPublic } from '../../users/entities/user.entity'
import { ActivityType } from '../activities.constants'
import { ApiProperty } from '@nestjs/swagger'
import { Organisation } from '../../organisations/entities/organisation.entity'
import { Expose } from 'class-transformer'

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
  user_id?: string

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
  meeting_point: Point

  @Column({
    type: 'enum',
    enum: ActivityType,
    default: ActivityType.Class
  })
  type: ActivityType

  @Column({
    type: 'tsvector',
    nullable: true
  })
  @Index('activity_tsv_index', { synchronize: false })
  tsv?: string

  @ManyToOne(() => User, (user) => user.activities, { nullable: true })
  owner?: User | UserPublic

  @ManyToOne(() => Team, (team) => team.activities, { nullable: true })
  team?: Team

  @ManyToOne(() => Organisation, (org) => org.activities, { nullable: true })
  organisation?: Organisation

  @ManyToOne(() => League, { nullable: true })
  league?: League

  @OneToMany(() => Image, (image) => image.activity)
  images: Image[]
}

export class ActivityForMap {
  @ApiProperty()
  @Expose()
  id: string

  @ApiProperty()
  @Expose()
  name: string

  @ApiProperty()
  @Expose()
  type: ActivityType

  @ApiProperty()
  @Expose()
  date: string

  @ApiProperty()
  @Expose()
  meeting_point: Geometry

  @ApiProperty()
  @Expose()
  images?: Image[]
}
