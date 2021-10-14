import { ApiProperty } from '@nestjs/swagger'

export class UpdateResultDto {
  @ApiProperty()
  affected: number
}
