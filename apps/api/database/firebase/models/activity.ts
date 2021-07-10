import { firestore } from 'firebase-admin'

export enum ActivityAccessScope {
  Team = 'team',
  Public = 'public'
}

export enum ActivityType {
  Class = 'class',
  Group = 'group',
  Routes = 'routes'
}

export interface ActivityFilters {
  keyword: string
  type: ActivityType[]
}

export interface ActivityTeam {
  team_id: string
  company: string
  photo_url_128x128: string
}

export interface ActivityUser {
  uid: string
  name: string
  photo_url_128x128: string | null
}

export interface Activity {
  access: ActivityAccessScope
  owner_uid: string
  owner: ActivityUser
  team_id: string
  team: ActivityTeam
  type: ActivityType
  date: string
  name: string
  keywords: string[]
  description: string
  meeting_point: firestore.GeoPoint
  meeting_point_text: string
  created_at: firestore.Timestamp
  updated_at: firestore.Timestamp
}

export interface ActivityWithId extends Activity {
  id: string
}

export interface CreateActivityDTO {
  team_id?: string
  type: ActivityType
  date: string
  name: string
  description: string
  meeting_point: string // lat,lng
  meeting_point_text: string
  organizer_image?: any
  images?: any[]
}
