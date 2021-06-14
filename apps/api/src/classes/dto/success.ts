import { ApiProperty } from '@nestjs/swagger'

export class SuccessResultDto {
  @ApiProperty()
  success: number
}
