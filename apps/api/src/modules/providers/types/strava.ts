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
