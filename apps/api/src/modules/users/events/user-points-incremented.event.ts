export class UserPointsIncrementedEvent {
  prev_points: number
  new_points: number
  user_id: string
  // used in saving the active_minutes_week field in the user.
  active_time?: number
}
