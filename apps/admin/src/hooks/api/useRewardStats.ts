import { useContext, useEffect } from 'react'
import { useQuery } from 'react-query'
import { AuthContext, FocusRole } from '../../context/Auth.context'
import { ApiResult } from '@fitlink/common/react-query/types'
import { formatISO, startOfDay, endOfDay } from 'date-fns'
import { Reward } from '@fitlink/api/src/modules/rewards/entities/reward.entity'

type Result = Reward & {
  redeem_count?: number
  image_url?: string
}

export default function useRewardStats(
  type: FocusRole,
  startAt: Date,
  endAt: Date
) {
  const { api, fetchKey } = useContext(AuthContext)

  const statsData: ApiResult<Result[]> = useQuery(
    `${fetchKey}_stats_rewards`,
    async () => {
      const query = {
        start_at: formatISO(startAt || startOfDay(new Date())),
        end_at: formatISO(endAt || endOfDay(new Date()))
      }

      if (type) {
        return api.get<Result[]>('/stats/rewards', {
          query
        })
      }

      return Promise.resolve([])
    },
    {
      refetchOnWindowFocus: false
    }
  )

  useEffect(() => {
    if (startAt) {
      statsData.refetch()
    }
  }, [startAt])

  return statsData
}
