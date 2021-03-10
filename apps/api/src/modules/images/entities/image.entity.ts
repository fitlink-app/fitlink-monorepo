import {
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Entity
} from 'typeorm'
import { Activity } from '../../activities/entities/activity.entity'

export enum ImageType {
  Avatar = 'avatar',
  Cover = 'cover'
}

@Entity()
export class Image {
  @CreateDateColumn()
  created_at: Date

  @UpdateDateColumn()
  updated_at: Date

  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  raw_url: string

  @ManyToOne(() => Activity, null, { nullable: true })
  activity: Activity

  /** Standard rescaled image (any ratio) */
  @Column()
  url: string

  /** Cropped image for avatars (1:1) */
  @Column()
  url_128x128: string

  /** Cropped image for hi-res avatars/tiles (1:1) */
  @Column()
  url_512x512: string

  /** Standard rescaled image width */
  @Column()
  width: number

  /** Standard rescaled image height */
  @Column()
  height: number

  @Column()
  original_width: number

  @Column()
  original_height: number

  @Column({
    type: 'enum',
    enum: ImageType
  })
  type: string
}
