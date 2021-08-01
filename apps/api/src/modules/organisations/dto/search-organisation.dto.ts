import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional } from 'class-validator'

export class SearchOrganisationDto {
  @ApiProperty()
  @IsOptional()
  q?: string
}
