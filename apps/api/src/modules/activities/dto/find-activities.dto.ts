import { ApiProperty } from '@nestjs/swagger'
import { IsOptional } from 'class-validator'
import { IsGeoRadial } from '../../../decorators/class-validator/IsGeoRadial'
import { IsIn } from 'class-validator'

export class FindActivitiesDto {
  @ApiProperty({
    required: false
  })
  @IsGeoRadial()
  @IsOptional()
  geo_radial?: string // long, lat, radius

  @ApiProperty({
    required: false
  })
  @IsIn(['1', '0'])
  @IsOptional()
  with_imin?: string

  @ApiProperty({
    required: false,
    default: '0'
  })
  page: string

  @ApiProperty({
    required: false,
    default: '50'
  })
  @ApiProperty()
  limit: string
}
