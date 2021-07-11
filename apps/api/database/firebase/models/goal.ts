import { firestore } from 'firebase-admin'

export enum UserGoalType {
  Steps = 'steps',
  FloorsClimbed = 'floors_climbed',
  WaterLitres = 'water_litres',
  SleepHours = 'sleep_hours',
  Mindfulness = 'mindfulness'
}

// export type Goals = {
//   [UserGoalType.Steps]: number
//   [UserGoalType.FloorsClimbed]: number
//   [UserGoalType.WaterLitres]: number
//   [UserGoalType.SleepHours]: number
// }

export type LegacyGoal = {
  created_at: firestore.Timestamp
  last_updated_at: firestore.Timestamp
  date: firestore.Timestamp
  floors_climbed: number
  mindfulness: number
  sleep_hours: number
  steps: number
  water_litres: number
}
