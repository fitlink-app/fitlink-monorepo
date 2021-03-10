import { PrimaryGeneratedColumn, Entity, Column } from 'typeorm'
import { CreatableEntity } from '../../../classes/entity/creatable'

@Entity()
export class Sport extends CreatableEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  /** Display name of the sport, e.g. Trail Running */
  @Column()
  name: string

  /** Snake-cased version of the sport, e.g. trail_running */
  @Column()
  name_key: string
}
