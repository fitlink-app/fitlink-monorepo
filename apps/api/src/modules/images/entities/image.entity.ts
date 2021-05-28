import { CreatableEntity } from '../../../classes/entity/creatable'
import { PrimaryGeneratedColumn, Column, ManyToOne, Entity } from 'typeorm'
import { Activity } from '../../activities/entities/activity.entity'

export enum ImageType {
  Avatar = 'avatar',
  Cover = 'cover',
  Standard = 'standard',
  Tile = 'tile'
}

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
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => Activity, (activity) => activity.images)
  activity?: Activity

  /** Alt text for accessibility */
  @Column({
    nullable: true
  })
  alt: string

  /** Standard rescaled image (any ratio) */
  @Column()
  url: string

  /** Standard rescaled image width */
  @Column()
  width: number

  /** Standard rescaled image height */
  @Column()
  height: number

  /** Cropped image for avatars (1:1) */
  @Column()
  url_128x128: string

  /** Cropped image for hi-res avatars/tiles (1:1) */
  @Column()
  url_512x512: string

  @Column()
  url_640x360: string

  /** The type which the image is actually optimised for */
  @Column({
    type: 'enum',
    enum: ImageType
  })
  type: string
}
