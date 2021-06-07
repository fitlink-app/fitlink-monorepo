import { CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'

export abstract class CreatableEntity {
  @ApiProperty()
  @CreateDateColumn()
  created_at: Date

  @ApiProperty()
  @UpdateDateColumn()
  updated_at: Date
}
