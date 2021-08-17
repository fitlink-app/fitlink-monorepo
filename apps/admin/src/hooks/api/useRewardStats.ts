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
  const { api, primary } = useContext(AuthContext)

  const statsData: ApiResult<Result[]> = useQuery(
    `${type}_${primary.team || primary.organisation}_stats_rewards`,
    async () => {
      const query = {
        start_at: formatISO(startAt || startOfDay(new Date())),
        end_at: formatISO(endAt || endOfDay(new Date()))
      }

      /**
       * Superadmin can view all stats
       */
      if (type === 'app') {
        return api.get<Result[]>('/stats/rewards', {
          query
        })
      }

      /**
       * Org admin can view all the org's stats
       */
      if (type === 'organisation') {
        return api.get<Result>('/organisations/:organisationId/stats/rewards', {
          query,
          organisationId: primary.organisation
        })
      }

      /**
       * Team admin can view all the team's stats
       */
      if (type === 'team') {
        return api.get<Result>('/teams/:teamId/stats/rewards', {
          query,
          teamId: primary.team
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
