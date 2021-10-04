import { ApiProperty } from '@nestjs/swagger'
import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional
} from 'class-validator'
import { ProviderType } from '../providers.constants'

export class CreateManualProviderDto {
  /**
   * This is the only field needed. Tokens for these providers
   * do not need to be stored.
   */
  @ApiProperty({
    enum: ProviderType
  })
  @IsIn([ProviderType.GoogleFit, ProviderType.AppleHealthkit])
  type: ProviderType

  // @ApiProperty()
  // @IsOptional()
  // @IsNotEmpty()
  // token: string

  // @ApiProperty()
  // @IsOptional()
  // @IsNotEmpty()
  // refresh_token: string

  // @ApiProperty()
  // @IsOptional()
  // @IsNumber()
  // token_expires_at: number

  // @ApiProperty()
  // @IsOptional()
  // @IsArray()
  // scopes: string[]

  // @ApiProperty()
  // @IsOptional()
  // @IsString()
  // provider_user_id: string
}
