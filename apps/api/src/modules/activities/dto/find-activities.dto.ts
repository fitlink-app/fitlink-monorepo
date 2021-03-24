import { IsOptional } from 'class-validator'
import { IsGeoRadial } from '../../../decorators/class-validator/IsGeoRadial'
import { IsIn } from 'class-validator'

export class FindActivitiesDto {
  @IsGeoRadial()
  @IsOptional()
  geo_radial?: string // long, lat, radius

  @IsIn(['1', '0'])
  @IsOptional()
  with_imin: string

  page: string
  limit: string
}
