export type FitbitEventData = {
  collectionType: FitbitNotificationCollectionType
  date: string
  ownerId: string
  ownerType: 'user' | string
  /** ID of the User's subscription (we set this to Fitlink user ID in our case) */
  subscriptionId: string
}

export type FitbitNotificationCollectionType =
  | 'activities'
  | 'body'
  | 'foods'
  | 'sleep'
  | 'userRevokedAccess'

export type FitbitResponseError = {
  errorType: string
  fieldName: string
  message: string
}

export type FitbitResponseBody = {
  errors?: FitbitResponseError[]
}

export interface FitbitSubscriptionResponseBody extends FitbitResponseBody {
  collectionType?: FitbitNotificationCollectionType
  ownerId?: string
  ownerType?: string | 'user'
  subscriptionId?: string
}

export interface FitbitAuthResponse {
  access_token: string
  expires_in: number
  refresh_token: string
  scope: string
  user_id: string
}
