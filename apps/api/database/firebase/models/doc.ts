import { firestore } from 'firebase-admin'

export interface DocWithId {
  id: string
}

export interface DocWithTimestamps {
  created_at: firestore.Timestamp
  updated_at: firestore.Timestamp
}

export interface DocWithTimestampsAndId extends DocWithId, DocWithTimestamps {}
