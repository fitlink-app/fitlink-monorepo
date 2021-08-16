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
  const { api, primary } = useContext(AuthContext)

  const healthActivitiesData: ApiResult<{
    results: any[]
    total: number
  }> = useQuery(
    `${type}_${primary.team || primary.organisation}_stats_health_activities`,
    () => {
      const query = {
        start_at: formatISO(startAt || startOfDay(new Date())),
        end_at: formatISO(endAt || endOfDay(new Date()))
      }

      /**
       * Superadmin can view all stats
       */
      if (type === 'app') {
        return api.list<any>('/stats/health-activities', {
          query
        })
      }

      /**
       * Team admin views stats for their primary team
       */
      if (type === 'team' && primary.team) {
        return api.list<any>('/teams/:teamId/stats/health-activities', {
          teamId: primary.team,
          query
        })
      }

      /**
       * Organisation views stats for their primary org
       */
      if (type === 'organisation' && primary.organisation) {
        return api.list<any>(
          '/organisations/:organisationId/stats/health-activities',
          {
            organisationId: primary.organisation,
            query
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
