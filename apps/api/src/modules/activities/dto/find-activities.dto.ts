import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsString } from 'class-validator'
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
    required: false
  })
  @IsOptional()
  type: string

  @ApiProperty({
    required: false
  })
  @IsOptional()
  keyword: string

  @ApiProperty({
    required: false,
    default: '0'
  })
  @IsOptional()
  page: string

  @ApiProperty({
    required: false,
    default: '50'
  })
  @IsOptional()
  limit: string
}

export class FindActivitiesForMapDto extends FindActivitiesDto {
  @ApiProperty({
    required: true
  })
  @IsGeoRadial()
  geo_radial: string // long, lat, radius
}
