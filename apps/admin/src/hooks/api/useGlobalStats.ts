import { useContext } from 'react'
import { useQuery } from 'react-query'
import { AuthContext, FocusRole } from '../../context/Auth.context'
import { ApiResult } from '@fitlink/common/react-query/types'

type Result = {
  league_count: number
  reward_count: number
}

export default function useLeagueStats(type: FocusRole) {
  const { api, fetchKey } = useContext(AuthContext)

  const statsData: ApiResult<Result> = useQuery(
    `${fetchKey}_stats_global`,
    async () => {
      if (type) {
        return api.get<Result>('/stats/global')
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
