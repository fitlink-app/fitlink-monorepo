import { ApiProperty } from '@nestjs/swagger'
import { IsOptional } from 'class-validator'
export class CreateDefaultSubscriptionDto {
  @ApiProperty()
  billing_entity: string

  @ApiProperty()
  @IsOptional()
  billing_address_1?: string

  @ApiProperty()
  @IsOptional()
  billing_address_2?: string

  @ApiProperty()
  @IsOptional()
  billing_city?: string

  @ApiProperty()
  @IsOptional()
  billing_country?: string

  @ApiProperty()
  @IsOptional()
  billing_state?: string

  @ApiProperty()
  @IsOptional()
  billing_country_code?: string

  @ApiProperty()
  @IsOptional()
  billing_postcode?: string

  @ApiProperty()
  @IsOptional()
  default?: boolean

}
