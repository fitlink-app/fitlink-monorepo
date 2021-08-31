import { QueryObserverOptions, useQuery } from 'react-query'
import { Sport } from '@fitlink/api/src/modules/sports/entities/sport.entity'
import { ApiResult } from '@fitlink/common/react-query/types'
import { AuthContext } from '../../context/Auth.context'
import { useContext, useEffect, useState } from 'react'

type Params = {
  enabled?: boolean
}

type Option = {
  label: string
  value: string
}

export default function useSports(params: Params = {}) {
  const [sportsOptionsList, setSportsOptionsList] = useState<Option[]>([])
  const { api } = useContext(AuthContext)

  const sportsQuery: ApiResult<{
    results: Sport[]
  }> = useQuery(
    `sports`,
    () =>
      api.list<Sport>('/sports', {
        limit: 100
      }),
    {
      keepPreviousData: true,
      ...params
    }
  )

  useEffect(() => {
    if (sportsQuery.data) {
      setSportsOptionsList(
        sportsQuery.data.results.map((sport) => {
          return {
            label: sport.name,
            value: sport.id
          }
        })
      )
    }
  }, [sportsQuery.data])

  return {
    sportsQuery,
    sportsOptionsList
  }
}
