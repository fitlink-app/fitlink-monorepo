import { useContext, useEffect } from 'react'
import { useQuery } from 'react-query'
import { AuthContext, FocusRole } from '../../context/Auth.context'
import { ApiResult } from '@fitlink/common/react-query/types'
import { formatISO, startOfDay, endOfDay } from 'date-fns'
import { League } from '@fitlink/api/src/modules/leagues/entities/league.entity'

type Result = League & {
  image_url?: string
}

export default function useLeagueStats(
  type: FocusRole,
  startAt: Date,
  endAt: Date
) {
  const { api, fetchKey, primary, focusRole } = useContext(AuthContext)

  const statsData: ApiResult<Result[]> = useQuery(
    `${fetchKey}_stats_leagues`,
    async () => {
      const query = {
        start_at: formatISO(startAt || startOfDay(new Date())),
        end_at: formatISO(endAt || endOfDay(new Date()))
      }

      if (type) {
        return api.get<Result[]>(
          '/stats/leagues',
          {
            query
          },
          {
            primary,
            useRole: focusRole
          }
        )
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
