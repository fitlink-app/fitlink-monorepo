import { useContext, useEffect } from 'react'
import { useQuery } from 'react-query'
import { AuthContext } from '../../context/Auth.context'
import { ApiResult } from '@fitlink/common/react-query/types'
import { formatISO, startOfDay, endOfDay } from 'date-fns'

export default function useHealthActivityStats(
  type: 'organisation' | 'team' | 'app',
  startAt: Date,
  endAt?: Date
) {
  const { api, fetchKey, primary, focusRole } = useContext(AuthContext)

  const healthActivitiesData: ApiResult<{
    results: any[]
    total: number
  }> = useQuery(
    `${fetchKey}_stats_health_activities`,
    () => {
      const query = {
        start_at: formatISO(startAt || startOfDay(new Date())),
        end_at: formatISO(endAt || endOfDay(new Date()))
      }

      /**
       * Superadmin can view all stats
       */
      if (type) {
        return api.list<any>(
          '/stats/health-activities',
          {
            query
          },
          {
            primary,
            useRole: focusRole
          }
        )
      }

      return Promise.resolve({
        results: [],
        total: 0
      })
    },
    {
      refetchOnWindowFocus: false
    }
  )

  useEffect(() => {
    if (startAt) {
      healthActivitiesData.refetch()
    }
  }, [startAt])

  return healthActivitiesData
}
