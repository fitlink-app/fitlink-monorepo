import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class DeleteFcmTokenDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  token: string
}
