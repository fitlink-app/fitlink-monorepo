export const STRAVA_AUTHORIZE_URL =
  'https://www.strava.com/oauth/mobile/authorize'

export const STRAVA_TOKEN_EXCHANGE_URL = 'https://www.strava.com/oauth/token'
export const STRAVA_DEAUTH_URL = 'https://www.strava.com/oauth/deauthorize'

export const STRAVA_ACTIVITY_TYPE_MAP: {
  [stravaActivityType: string]: string
} = {
  AlpineSki: 'skiing',
  BackcountrySki: 'skiing',
  // Canoeing: "fitlink_value",
  Crossfit: 'crossfitTraining',
  // EBikeRide: "fitlink_value",
  // Elliptical: "fitlink_value",
  // Golf: "fitlink_value",
  // Handcycle: "fitlink_value",
  Hike: 'hiking',
  // IceSkate: "fitlink_value",
  // InlineSkate: "fitlink_value",
  // Kayaking: "fitlink_value",
  // Kitesurf: "fitlink_value",
  NordicSki: 'skiing',
  Ride: 'cycling',
  // RockClimbing: "fitlink_value",
  // RollerSki: "fitlink_value",
  Rowing: 'rowing',
  Run: 'running',
  // Sail: "fitlink_value",
  // Skateboard: "fitlink_value",
  Snowboard: 'snowboarding',
  // Snowshoe: "fitlink_value",
  // Soccer: "fitlink_value",
  // StairStepper: "fitlink_value",
  // StandUpPaddling: "fitlink_value",
  Surfing: 'surfing',
  Swim: 'swimming',
  // Velomobile: "fitlink_value",
  // VirtualRide: "fitlink_value",
  // VirtualRun: "fitlink_value",
  Walk: 'walking',
  WeightTraining: 'weightLifting',
  // Wheelchair: "fitlink_value",
  // Windsurf: "fitlink_value",
  // Workout: "fitlink_value",
  Yoga: 'yoga'
}

export const FITBIT_ACTIVITY_TYPE_MAP: {
  [fitbitActivityType: string]: string
} = {
  Skiing: 'skiing',
  'Cross Country Skiing': 'skiing',
  CrossFit: 'crossfitTraining',
  Hike: 'hiking',
  Bike: 'cycling',
  'Mountain Bike': 'cycling',
  Rowing: 'rowing',
  Run: 'running',
  'Surfing, body or board': 'surfing',
  Swim: 'swimming',
  Walk: 'walking',
  Yoga: 'yoga'
}
