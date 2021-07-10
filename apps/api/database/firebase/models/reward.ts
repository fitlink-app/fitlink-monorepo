import { firestore } from 'firebase-admin'

export enum LegacyRewardAccessScope {
  Team = 'team',
  Public = 'public'
}

export interface LegacyCreateRewardDTO {
  title: string
  title_short: string
  description: string
  code: string
  points_required: number
  brand: string
  reward_expires_at: string
  redeem_url?: string
  redeem_instructions?: string
  team_id: string
  image?: any
}

export interface LegacyReward {
  access: LegacyRewardAccessScope
  public: boolean
  id: string
  title: string
  title_short: string
  description: string
  photo_url: string
  code: string
  redeem_url?: string
  redeem_instructions?: string
  points_required: number
  brand: string
  redeemed_count: number
  reward_expires_at: firestore.Timestamp
  created_at: firestore.Timestamp
  updated_at: firestore.Timestamp
  team_id?: string
  team?: LegacyRewardTeam
}

export interface LegacyRewardWithId extends LegacyReward {
  id: string
}

export interface LegacyRewardUpdate
  extends Omit<LegacyCreateRewardDTO, 'reward_expires_at'> {
  reward_expires_at: string | firestore.Timestamp
  photo_url?: string
}

export interface LegacyRewardTeam {
  team_id: string
  team_name: string
  photo_url_128x128: string
}

export interface LegacyAllRewardsItem {
  public: boolean
  points_required: number
  reward_expires_at: firestore.Timestamp
  team?: LegacyRewardTeam
}

export type LegacyAllRewardsMap = { [rewardId: string]: LegacyAllRewardsItem }
