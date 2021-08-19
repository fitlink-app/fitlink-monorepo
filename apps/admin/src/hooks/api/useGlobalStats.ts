import { useContext } from 'react'
import { useQuery } from 'react-query'
import { AuthContext, FocusRole } from '../../context/Auth.context'
import { ApiResult } from '@fitlink/common/react-query/types'

type Result = {
  league_count: number
  reward_count: number
}

export default function useLeagueStats(type: FocusRole) {
  const { api, primary } = useContext(AuthContext)

  const statsData: ApiResult<Result> = useQuery(
    `${type}_${primary.team || primary.organisation}_stats_global`,
    async () => {
      /**
       * Superadmin can view all stats
       */
      if (type === 'app') {
        return api.get<Result>('/stats/global')
      }

      /**
       * Org admin can view all the org's stats
       */
      if (type === 'organisation') {
        return api.get<Result>('/organisations/:organisationId/stats/global', {
          organisationId: primary.organisation
        })
      }

      /**
       * Team admin can view all the team's stats
       */
      if (type === 'team') {
        return api.get<Result>('/teams/:teamId/stats/global', {
          teamId: primary.team
        })
      }

      return Promise.resolve({
        league_count: 0,
        reward_count: 0
      })
    },
    {
      refetchOnWindowFocus: false
    }
  )

  return statsData
}
