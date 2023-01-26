import {
  PrimaryGeneratedColumn,
  Column,
  Entity,
  Index,
  ManyToOne,
  JoinColumn,
  DeleteDateColumn
} from 'typeorm'
import { IsInt, Min } from 'class-validator'
import { CreatableEntity } from '../../../classes/entity/creatable'

// when saving numbers as bigint postgress will return them as strings, we use this to convert them to integers
export class ColumnNumberTransformer {
  public to(data: number): number {
    return data
  }

  public from(data: string): number {
    // output value, you can use Number, parseFloat variations
    // also you can add nullable condition:
    // if (!Boolean(data)) return 0;

    return parseInt(data)
  }
}

@Entity()
export class LeagueBfitEarnings extends CreatableEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  league_id: string

  @Column()
  user_id: string

  @Column({
    type: 'bigint',
    default: 0,
    transformer: new ColumnNumberTransformer()
  })
  bfit_amount: number
}
