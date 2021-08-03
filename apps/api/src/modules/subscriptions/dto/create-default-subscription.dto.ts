import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsOptional, IsString } from 'class-validator'
import { SubscriptionType } from '../subscriptions.constants'
export class CreateDefaultSubscriptionDto {
  @ApiProperty()
  @IsString()
  billing_entity: string

  @ApiProperty()
  @IsOptional()
  billing_first_name?: string

  @ApiProperty()
  @IsOptional()
  billing_last_name?: string

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

  @ApiProperty()
  @IsEnum(SubscriptionType)
  @IsOptional()
  type?: string
}
