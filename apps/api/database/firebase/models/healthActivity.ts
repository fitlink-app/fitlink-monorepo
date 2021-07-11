import { firestore } from 'firebase-admin'

export enum LegacyHealthActivityType {
  RUNNING = 'running',
  CYCLING = 'cycling',
  SWIMMING = 'swimming',
  WALKING = 'walking',
  CROSSFIT = 'crossfitTraining',
  HIIT = 'highIntensityIntervalTraining',
  SKIING = 'skiing',
  HIKING = 'hiking',
  SNOWBOARDING = 'snowboarding',
  ROWING = 'rowing',
  SURFING = 'surfing',
  YOGA = 'yoga'
}

export enum LegacyLifestyleActivityType {
  STEPS = 'steps',
  HYDRATION = 'hydration',
  SLEEP = 'sleep',
  MINDFULNESS = 'mindfulness'
}

export type LegacyHealthProviderType =
  | 'strava'
  | 'fitbit'
  | 'google_fit'
  | 'apple_healthkit'

export type LegacyHealthProvider = {
  /** Provider identifier e.g.: strava, google-fit */
  type: LegacyHealthProviderType
  /** User's identifier with the provider service */
  provider_user_id: string
  /** User's access token to the provider service  */
  token: string
  /** User's refresh token to the provider service  */
  refresh_token: string
  /** Access token expiry in epoch milliseconds  */
  token_expires_at: number
  /** Scopes the user gave for Fitlink with this service */
  scopes: string[]
  updated_at: firestore.Timestamp
  created_at: firestore.Timestamp
}

export type LegacyHealthActivityDTO = {
  /**
   * Type of the activity e.g. "steps|cycling|running|hydration|sleep"mindfulness"
   */
  type: LegacyHealthActivityType | LegacyLifestyleActivityType
  provider: LegacyHealthProviderType
  provider_account_id: string | null
  /** ISO 8601 */
  start_time: string
  /** ISO 8601 */
  end_time: string
  active_time?: number
  calories: number
  distance?: number
  quantity?: number
  elevation?: number
  /** Optional polyline string given by Strava, e.g. for a running route */
  polyline?: string
}

export type LegacyLifestyleActivityDTO = {
  /** Steps | Hydration | Sleep | Mindfulness */
  type: LegacyLifestyleActivityType

  /** Typically Google Fit or Apple Healthkit */
  provider: LegacyHealthProviderType

  /** ISO 8601
   * Used to determine duration of sleep session
   * or mindfulness session
   */
  start_time: string

  /** ISO 8601
   * Used to determine duration of sleep session
   * or mindfulness session
   */
  end_time: string

  /** Total calories burned */
  calories: number | null

  /**
   * total number of steps or,
   * liters of water consumed */
  quantity: number | null
}

export interface LegacyHealthActivity {
  /**
   * Type of the activity e.g. "steps|cycling|running|hydration|sleep"mindfulness"
   */
  type: LegacyHealthActivityType | LegacyLifestyleActivityType

  /** The provider service e.g. strava, fitbit, google_fit, apple_healthkit*/
  provider: LegacyHealthProviderType

  /** The associated account id given to each user uniquely */
  provider_account_id: string | null

  /** The points associated to the health activity */
  points: number

  /** The start time of the activity, used for time-based activities like mindfulness */
  start_time: firestore.Timestamp

  /** The end time of the activity, used for time-based activities like mindfulness */
  end_time: firestore.Timestamp

  /** Active duration of an activity in seconds, if available. It does account for pauses or breaks */
  active_time?: number

  /** The calories burned by the activity as provided by the service */
  calories: number

  /** Distance expressed in meters */
  distance: number | null

  /** Quantity, used for the lifestyle activity "steps", "hydration" */
  quantity: number | null

  /** Elevation, used for stairs */
  elevation: number | null

  /**
   * Stairs, used for lifestyle activity.
   * In a commercial building or apartment situation,
   * floor to floor height might typically be 3.2 meters (18 ergonomic steps)
   */
  stairs: number | null

  /** Images which the user will associate after the activity appears in-app */
  images: { [imageId: string]: string }
  created_at: firestore.Timestamp
  updated_at: firestore.Timestamp

  polyline?: string
}

export interface HealthActivityWithId extends LegacyHealthActivity {
  id: string
}

export interface HealthActivityUpdate
  extends Omit<LegacyHealthActivity, 'images'> {
  images: firestore.FieldValue
}

export interface HealthActivityDateRange {
  /**
   * ID of the activity in 'user/health_activities' collection
   */
  i: string
  /**
   * Start time of the activity
   */
  s: firestore.Timestamp
  /**
   * End time of the activity
   */
  e: firestore.Timestamp
}

export interface ShareableImageStat {
  value: string
  label: string
}
