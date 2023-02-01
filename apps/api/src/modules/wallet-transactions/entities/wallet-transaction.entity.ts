import { CreatableEntity } from '../../../classes/entity/creatable'
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn
} from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { WalletTransactionSource } from '../wallet-transactions.constants'

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
export class WalletTransaction extends CreatableEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ApiProperty()
  @Column({
    type: 'enum',
    enum: WalletTransactionSource,
    default: WalletTransactionSource.LeagueBfitEarnings
  })
  source: WalletTransactionSource

  @Column({
    nullable: true
  })
  earnings_id?: string

  @Column({
    nullable: true
  })
  claim_id?: string

  @Column({
    nullable: true
  })
  reward_redemption_id?: string

  @Column({
    nullable: true
  })
  reward_name?: string

  @Column({
    nullable: true
  })
  league_id?: string

  @Column({
    nullable: true
  })
  league_name?: string

  @Column({})
  user_id: string

  @ApiProperty()
  @Column({
    type: 'bigint',
    default: 0,
    transformer: new ColumnNumberTransformer()
  })
  bfit_amount: number
}
