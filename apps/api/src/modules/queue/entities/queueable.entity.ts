import { PrimaryGeneratedColumn, Entity, Column } from 'typeorm'
import { CreatableEntity } from '../../../classes/entity/creatable'
import { QueueablePayload } from '../../../models/queueable.model'

@Entity()
export class Queueable extends CreatableEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  process_after: Date

  @Column({
    type: 'jsonb'
  })
  payload: QueueablePayload

  @Column({
    default: false
  })
  completed: boolean

  @Column({
    default: false
  })
  errored: boolean

  @Column({
    nullable: true,
    type: 'text'
  })
  error: string

  @Column({
    default: 'default'
  })
  worker: string
}
