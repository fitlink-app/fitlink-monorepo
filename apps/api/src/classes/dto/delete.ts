import { ApiProperty } from '@nestjs/swagger'

export class DeleteResultDto {
  @ApiProperty()
  affected: number
}
