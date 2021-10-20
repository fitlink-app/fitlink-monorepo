import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class CreateFcmTokenDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  token: string
}
