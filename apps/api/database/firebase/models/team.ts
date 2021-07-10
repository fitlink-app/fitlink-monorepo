import { firestore } from 'firebase-admin'
import firebase from 'firebase'

export interface TeamDTO {
  billing_address?: BillingAddress
  billing_email: string
  company: string
  photo_url: string
  photo_url_128x128: string
  photo_url_512x512: string
  timezone: string
}

export type BillingAddress = {
  first_name: string
  last_name: string
  line1: string
  line2: string
  city: string
  state: string
  zip: string
  country: string
}

export type BillingSubscription = {
  status: 'active' | 'canceled'
  customer_id: string
  trial_end: firestore.Timestamp
}

export interface Team {
  admin: string[]
  billing_address?: BillingAddress
  billing_subscription?: BillingSubscription
  preferred_currency_code?: string
  company: string
  photo_url: string
  photo_url_128x128: string
  photo_url_512x512?: string
  timezone: string
}

export interface TeamWithId extends Team {
  id: string
}

export interface TeamUpdate extends Omit<Team, 'admin'> {
  admin: firebase.firestore.FieldValue
}

export interface TeamStats {
  team_id: string
  date: firestore.Timestamp
  day_of_week?: number
  total_points: number
  member_points: { [uid: string]: number }
  sports_distribution: { [sport: string]: number }
  active_users: number
  user_invites_sent: number
  user_invites_accepted: number
}

export interface TeamStatsWithId extends TeamStats {
  id: string
}

export type TeamInvitationStatus = 'sent' | 'accepted' | 'declined'

export interface TeamInvitation {
  /** ID of the team where the invitation is created */
  team_id: string

  /** Name of the team */
  team_name: string

  /** Avatar of team */
  thumbnail: string | null

  /** Invited user's name */
  user_name: string

  /** UID if the invited user already exists */
  user_id?: string

  /** E-mail address of the invited user */
  email: string

  /** Status of the invitation */
  status: TeamInvitationStatus

  /** Creation date of the invitation */
  created_at: firestore.Timestamp
}

export interface TeamInvitationWithId extends TeamInvitation {
  invitation_id: string
}
