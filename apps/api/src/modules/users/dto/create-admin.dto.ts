import { ApiProperty } from '@nestjs/swagger'
import { IsUUID } from 'class-validator'

export class CreateAdminDto {
  @ApiProperty()
  @IsUUID()
  userId?: string
}
