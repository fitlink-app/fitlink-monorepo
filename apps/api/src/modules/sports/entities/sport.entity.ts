import { PrimaryGeneratedColumn, Entity, Column, OneToMany } from 'typeorm'
import { CreatableEntity } from '../../../classes/entity/creatable'
import { HealthActivity } from '../../health-activities/entities/health-activity.entity'
import { League } from '../../leagues/entities/league.entity'

@Entity()
export class Sport extends CreatableEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  /** Display name of the sport, e.g. Trail Running */
  @Column({
    unique: true
  })
  name: string

  /** Snake-cased version of the sport, e.g. trail_running */
  @Column({
    unique: true
  })
  name_key: string

  /** Singular display of the sport, e.g. trail run */
  @Column()
  singular: string

  /** Plural display of the sport, e.g. trail runs */
  @Column()
  plural: string

  @OneToMany(() => HealthActivity, (healthActivity) => healthActivity.sport)
  health_activities: HealthActivity[]

  @OneToMany(() => League, (league) => league.sport)
  leagues: League[]

  @Column({
    default: false
  })
  show_pace: boolean

  @Column({
    nullable: true
  })
  image_url?: string

  @Column({
    type: 'text',
    default: `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="32" fill="#ffffff" fill-opacity="0"/></svg>`
  })
  icon_svg: string
}
