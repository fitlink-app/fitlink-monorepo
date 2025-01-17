import { ProviderType } from '../providers.constants'

export class CreateProviderDto {
  type: ProviderType
  token: string
  refresh_token: string
  token_expires_at: Date
  scopes: string[]
  provider_user_id: string
}
