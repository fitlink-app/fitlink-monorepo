import { ApiProperty } from '@nestjs/swagger'
import { IsOptional } from 'class-validator'
import { Image } from '../../images/entities/image.entity'

export class CreateTeamDto {
  @ApiProperty()
  name: string

  @ApiProperty()
  @IsOptional()
  avatar?: Image
}
