import { ProviderType } from '@fitlink/api/src/modules/providers/providers.constants'

export const providers = {
  [ProviderType.GoogleFit]: 'Google Fit',
  [ProviderType.Fitbit]: 'Fitbit',
  [ProviderType.Strava]: 'Strava',
  [ProviderType.AppleHealthkit]: 'Apple Health'
}
