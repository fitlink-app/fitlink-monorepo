import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsString, IsNotEmpty, IsUUID } from 'class-validator'

export class CreateTeamDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty()
  @IsUUID(4, {
    message: 'Must be a valid image id'
  })
  @IsOptional()
  imageId?: string
}
