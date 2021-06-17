import { ApiProperty } from '@nestjs/swagger'

export class ValidationResultDto {
  @ApiProperty({
    example: {
      field_name: 'Must be a valid field',
      field_name_2: 'Must be at least 10 characters in length'
    }
  })
  errors: NodeJS.Dict<string>

  @ApiProperty()
  message: string
}
