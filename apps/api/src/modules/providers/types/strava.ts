export type StravaEventData = {
  /** Type of event data */
  object_type: 'activity' | 'athlete'

  /** For activity events, the activity's ID. For athlete events, the athlete's ID. */
  object_id: number

  aspect_type: 'create' | 'update' | 'delete'

  /**
   * For activity update events, keys can contain "title," "type," and "private,"
   * For app deauthorization events, there is always an "authorized" : "false" key-value pair.
   */
  updates: { [key: string]: any }

  /** The athlete's ID. */
  owner_id: number

  /** The push subscription ID that is receiving this event. */
  subscription_id: number

  /** The time that the event occurred. */
  event_time: number
}

export interface StravaCallbackResponse {
  expires_at: number
  refresh_token: string
  access_token: string
  athlete: {
    id: string
  }
}

export interface StravaRefreshTokenResponse {
  expires_at: number
  refresh_token: string
  access_token: string
}

type StravaDeauthError = {
  resource: string
  field: string
  code: string
}

export type StravaDeauthResponse = {
  access_token?: string
  message?: string
  errors?: StravaDeauthError[]
}

export type StravaActivityType =
  | 'AlpineSki'
  | 'BackcountrySki'
  | 'Canoeing'
  | 'Crossfit'
  | 'EBikeRide'
  | 'Elliptical'
  | 'Golf'
  | 'Handcycle'
  | 'Hike'
  | 'IceSkate'
  | 'InlineSkate'
  | 'Kayaking'
  | 'Kitesurf'
  | 'NordicSki'
  | 'Ride'
  | 'RockClimbing'
  | 'RollerSki'
  | 'Rowing'
  | 'Run'
  | 'Sail'
  | 'Skateboard'
  | 'Snowboard'
  | 'Snowshoe'
  | 'Soccer'
  | 'StairStepper'
  | 'StandUpPaddling'
  | 'Surfing'
  | 'Swim'
  | 'Velomobile'
  | 'VirtualRide'
  | 'VirtualRun'
  | 'Walk'
  | 'WeightTraining'
  | 'Wheelchair'
  | 'Windsurf'
  | 'Workout'
  | 'Yoga'

export type StravaActivity = {
  /** Activity ID */
  id: number

  /** Strava user */
  athlete: {
    id: number
  }

  /** The name of the activity, e.g. "Chill day" */
  name: string

  /** Activity type */
  type: StravaActivityType

  /** Start date of the activity */
  start_date: string

  /** Elapsed time in *seconds* since start_date*/
  elapsed_time: number

  /** Active duration of an activity in seconds. It does account for pauses or breaks */
  moving_time: number

  /** Distance in meters */
  distance: number

  /** Calories */
  calories: number

  /** Elevation gain in meters */
  total_elevation_gain: number

  map: {
    polyline?: string
    summary_polyline?: string
  }
}

export type StravaAuthResponse = {
  token_type: string

  /** The number of seconds since the epoch when the provided access token will expire */
  expires_at: number

  /** Seconds until the short-lived access token will expire */
  expires_in: number

  refresh_token: string

  access_token: string
}

export interface StravaAuthResponseWithAthlete extends StravaAuthResponse {
  athlete: {
    id: number
  }
}
