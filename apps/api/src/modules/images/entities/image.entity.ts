import { CreatableEntity } from '../../../classes/entity/creatable'
import {
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Entity,
  JoinColumn
} from 'typeorm'
import { Activity } from '../../activities/entities/activity.entity'
import { ApiProperty } from '@nestjs/swagger'
import { HealthActivity } from '../../health-activities/entities/health-activity.entity'
import { User } from '../../users/entities/user.entity'
import { ImageType } from '../images.constants'
import { Expose } from 'class-transformer'

export const uploadVariants = [
  {
    type: ImageType.Avatar,
    size: [128, 128],
    fit: 'cover',
    column: 'url_128x128'
  },
  {
    type: ImageType.Cover,
    size: [640, 360],
    fit: 'cover',
    column: 'url_640x360'
  },
  {
    type: ImageType.Standard,
    size: [1920, 0], // 0 is ignored, and aspect ratio preserved
    fit: null,
    column: 'url'
  },
  {
    type: ImageType.Tile,
    size: [512, 512],
    fit: 'cover',
    column: 'url_512x512'
  }
] as const

@Entity()
export class Image extends CreatableEntity {
  @ApiProperty()
  @Expose()
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => Activity, (activity) => activity.images)
  activity?: Activity

  @ManyToOne(
    () => HealthActivity,
    (health_activity) => health_activity.images,
    {
      nullable: true
    }
  )
  @JoinColumn()
  health_activity?: HealthActivity

  /** Alt text for accessibility */
  @Expose()
  @ApiProperty()
  @Column({
    nullable: true
  })
  alt: string

  /** Standard rescaled image (any ratio) 1920px wide */
  @ApiProperty()
  @Column()
  @Expose()
  url: string

  /** Standard rescaled image width */
  @ApiProperty()
  @Column()
  @Expose()
  width: number

  /** Standard rescaled image height */
  @ApiProperty()
  @Column()
  @Expose()
  height: number

  /** Cropped image for avatars (1:1) */
  @ApiProperty()
  @Column()
  @Expose()
  url_128x128: string

  /** Cropped image for hi-res avatars/tiles (1:1) */
  @ApiProperty()
  @Column()
  @Expose()
  url_512x512: string

  @ApiProperty()
  @Column()
  @Expose()
  url_640x360: string

  /** The type which the image is actually optimised for */
  @ApiProperty()
  @Column({
    type: 'enum',
    enum: ImageType
  })
  @Expose()
  type: ImageType

  /** The image owner */
  @ManyToOne(() => User, (user) => user.image_uploads)
  @JoinColumn()
  owner?: User
}
