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

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  deviceId?: string
}
