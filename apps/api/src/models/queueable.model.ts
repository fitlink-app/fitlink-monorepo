export type QueueablePayload = {
  /** Id(s) of the object(s) to be loaded */
  subject?: string | string[]

  /** Type of the object to be loaded */
  type: string

  /** The action to perform */
  action: string
}

export type QueueableEventPayload = {
  payload: QueueablePayload
  resolve: () => void
  reject: (err?: string) => void
}
