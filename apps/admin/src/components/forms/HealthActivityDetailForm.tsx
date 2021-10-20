import { HealthActivityDebug } from '@fitlink/api/src/modules/health-activities/entities/health-activity-debug.entity'

export type CreateMessageProps = {
  current: Partial<HealthActivityDebug>
}

const noop = () => {}

export default function UserDetail({ current }: CreateMessageProps) {
  return (
    <>
      <h5>Processed (normalised) data</h5>
      <pre>{JSON.stringify(current.processed, null, 2)}</pre>

      <h5>Raw data</h5>
      <pre>{JSON.stringify(current.raw, null, 2)}</pre>
    </>
  )
}
