import { ApiProperty } from '@nestjs/swagger'

export class ErrorDto {
  @ApiProperty()
  statusCode: number

  @ApiProperty()
  message: string
}

export class ForbiddenErrorDto extends ErrorDto {
  @ApiProperty({
    default: 401
  })
  statusCode: number
  @ApiProperty({
    default: 'Unauthorized'
  })
  message: string
}

export class ServerErrorDto {
  @ApiProperty({
    default: 500
  })
  statusCode: number
  @ApiProperty({
    default: 'Internal server error'
  })
  message: string
}
