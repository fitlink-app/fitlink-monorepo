import { IsArray, IsIn, IsNotEmpty, IsNumber, IsString } from 'class-validator'
import { ProviderType } from '../providers.constants'

export class CreateManualProviderDto {
  @IsIn([ProviderType.GoogleFit, ProviderType.AppleHealthkit])
  type: ProviderType

  @IsNotEmpty()
  token: string

  @IsNotEmpty()
  refresh_token: string

  @IsNumber()
  token_expires_at: number

  @IsArray()
  scopes: string[]

  @IsString()
  provider_user_id: string
}
