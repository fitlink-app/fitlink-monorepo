import { PrimaryGeneratedColumn, Entity, Column } from 'typeorm'
import { CreatableEntity } from '../../../classes/entity/creatable'

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
}
