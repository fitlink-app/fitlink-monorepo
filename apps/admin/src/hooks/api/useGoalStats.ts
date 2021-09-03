import { useContext, useEffect } from 'react'
import { useQuery } from 'react-query'
import { AuthContext } from '../../context/Auth.context'
import { ApiResult } from '@fitlink/common/react-query/types'
import { formatISO, startOfDay, endOfDay } from 'date-fns'
import { FocusRole } from '@fitlink/api-sdk/types'

type Result = {
  goal_steps: number
  current_steps: number
  goal_sleep_hours: number
  current_sleep_hours: number
  goal_mindfulness_minutes: number
  current_mindfulness_minutes: number
  goal_floors_climbed: number
  current_floors_climbed: number
  goal_water_litres: number
  current_water_litres: number
  user_active_count: number
  user_total_count: number
}

type Progress = {
  progress_steps: number
  progress_mindfulness_minutes: number
  progress_sleep_hours: number
  progress_floors_climbed: number
  progress_water_litres: number
  progress_active_users: number
}

export default function useGoalStats(
  type: FocusRole,
  startAt: Date,
  endAt?: Date
) {
  const { api, primary, focusRole } = useContext(AuthContext)

  const goalStatsData: ApiResult<Result & Progress> = useQuery(
    `${type}_${primary.team || primary.organisation}_stats_goals`,
    async () => {
      const query = {
        start_at: formatISO(startAt || startOfDay(new Date())),
        end_at: formatISO(endAt || endOfDay(new Date()))
      }

      /**
       * Endpoint is adjusted based on role
       */
      if (type) {
        const result = await api.get<Result>(
          '/stats/goals',
          {
            query
          },
          {
            primary,
            useRole: focusRole
          }
        )

        return formatResults(result)
      }

      return Promise.resolve({
        goal_steps: 0,
        current_steps: 0,
        goal_sleep_hours: 0,
        current_sleep_hours: 0,
        goal_mindfulness_minutes: 0,
        current_mindfulness_minutes: 0,
        goal_floors_climbed: 0,
        current_floors_climbed: 0,
        goal_water_litres: 0,
        current_water_litres: 0,
        user_active_count: 0,
        user_total_count: 0,
        progress_steps: 0,
        progress_active_users: 0,
        progress_floors_climbed: 0,
        progress_sleep_hours: 0,
        progress_mindfulness_minutes: 0,
        progress_water_litres: 0
      })
    },
    {
      refetchOnWindowFocus: false
    }
  )

  useEffect(() => {
    if (startAt) {
      goalStatsData.refetch()
    }
  }, [startAt])

  return goalStatsData
}

function formatResults(result: Result) {
  Object.keys(result).forEach((each) => {
    result[each] = parseInt(result[each]) || 0
  })

  return {
    ...result,
    ...getProgress(result)
  }
}

function calcProgress(current: number, goal: number) {
  if (goal) {
    return Math.floor((current / goal) * 100)
  }

  return 0
}

function getProgress(result: Result) {
  return {
    progress_steps: calcProgress(result.current_steps, result.goal_steps),
    progress_mindfulness_minutes: calcProgress(
      result.current_mindfulness_minutes,
      result.goal_mindfulness_minutes
    ),
    progress_sleep_hours: calcProgress(
      result.current_sleep_hours,
      result.goal_sleep_hours
    ),
    progress_floors_climbed: calcProgress(
      result.current_floors_climbed,
      result.goal_floors_climbed
    ),
    progress_water_litres: calcProgress(
      result.current_water_litres,
      result.goal_water_litres
    ),
    progress_active_users: calcProgress(
      result.user_active_count,
      result.user_total_count
    )
  }
}
