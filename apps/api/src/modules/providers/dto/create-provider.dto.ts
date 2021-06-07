import { ProviderType } from '../entities/provider.entity'

export class CreateProviderDto {
  type: ProviderType
  token: string
  refresh_token: string
  token_expires_at: number
  scopes: string[]
  provider_user_id: string
}
