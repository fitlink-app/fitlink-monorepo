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

export type FitbitActivity = {
  startTime: string

  /** Duration in ms */
  duration: number

  /** Active duration of an activity in seconds. It does account for pauses or breaks */
  activeDuration: number

  activityName: string

  activityTypeId: number

  calories: number

  distance: number

  distanceUnit: 'Kilometer' | string
}

export type FitbitUserUpdates = {
  [subscriptionId: string]: FitbitEventData[]
}

export interface FitbitActivityResponseBody extends FitbitResponseBody {
  activities: FitbitActivity[]
  summary: {
    steps?: number
    floors?: number
  }
}

/** Common between any service, the higher number is always taken as latest */
export type LifestyleGoalActivityDTO = {
  /** The total hours of sleep for the current day */
  sleep_hours: number

  /** The total number of steps taken for the current day */
  steps: number

  /** The total number of litres of water for the current day */
  water_litres: number

  /** The total number of mindfulness minutes  */
  mindfulness: number

  /** The total number of flights climbed  */
  floors_climbed: number
}

export interface FitbitSleepResponseBody extends FitbitResponseBody {
  sleep: any[]
  summary: {
    totalMinutesAsleep: number
  }
}
