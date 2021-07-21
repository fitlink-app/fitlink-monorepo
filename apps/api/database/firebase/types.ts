import { firestore } from "firebase-admin";
import { AuthProviderType } from '../../src/modules/auth/entities/auth-provider.entity';

export type LegacyReward = {
  team_id: string
  access: 'team' | 'public'
  brand: string
  code: string
  description: string
  id: string
  photo_url: string
  points_required: string
  public: boolean
  redeem_instructions: string
  redeem_url: string
  redeemed_count: number
  reward_expires_at: firestore.Timestamp
  title: string
  title_short: string
}

export type LegacyUser = {
  localId: string
  email?: string
  emailVerified?: boolean
  passwordHash?: string
  salt?: string
  lastSignedInAt: string
  createdAt: string
  disabled: boolean
  photoUrl?: string
  providerUserInfo: {
    providerId: AuthProviderType
    email: string
    rawId?: string
    displayName?: string
    photoUrl?: string
  }[]
}
]

export type LegacyTeam = {
  admin: string[]
  billing_address: {
    city: string
    country: string
    first_name: string
    last_name: string
    line1: string
    line2: string
    state: string
    zip: string
  }
  billing_email: string
  billing_first_name: string
  billing_last_name: string
  billing_subscription: {
    customer_id: string
    status: string
    trial_end: firestore.Timestamp
  }
  company: string
  last_billed_month: string
  photo_url: string
  preferred_currency_code: string
  timezone: string
  user_count: string
}

