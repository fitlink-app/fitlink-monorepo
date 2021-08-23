import React, { useMemo, useState, useEffect } from 'react'
import { Table, TablePagination } from './Table'
import { Column } from 'react-table'
import { ApiResult } from '@fitlink/common/react-query/types'
import { getErrorMessage } from '@fitlink/api-sdk'
import { useQuery } from 'react-query'

export type TableContainerProps = {
  columns: Column<any>[]
  fetchName: string
  refresh?: number
  fetch: (limit: number, page: number) => Promise<ListData>
}

type ListData = {
  results: any[]
  page_total: number
  total: number
}

export function TableContainer({
  columns,
  fetchName,
  refresh,
  fetch
}: TableContainerProps) {
  const [results, setResults] = useState([])
  const [errorMessage, setError] = useState('')

  const [pagination, setPagination] = useState<TablePagination>({
    page: 0,
    pageCount: 0,
    pageTotal: 0,
    total: 0,
    limit: 10
  })

  const memoizedColumns = useMemo(() => columns, [])

  const { limit, page } = pagination
  const {
    data,
    isError,
    error,
    isFetching,
    isFetched,
    isPreviousData,
    refetch
  }: ApiResult<ListData> = useQuery(
    [fetchName, limit, page],
    async () => {
      return fetch(limit, page)
    },
    {
      retry: false,
      keepPreviousData: true,

      // NOTE: This causes the behaviour of duplicate ajax queries in network inspector
      // It can be re-enabled but having dev console open produces this behaviour by default
      // due to window focusing in / out.
      refetchOnWindowFocus: false
    }
  )

  useEffect(() => {
    if (data && !isError) {
      const { total, page_total, results } = data as ListData
      setPagination({
        ...pagination,
        pageCount: Math.ceil(total / limit),
        pageTotal: page_total,
        total
      })
      setResults(results)
    }
  }, [data, page])

  useEffect(() => {
    if (isError) {
      setError(getErrorMessage(error))
    }
  }, [isError])

  useEffect(() => {
    refresh && refetch()
  }, [refresh])

  // TODO: show better UI
  return errorMessage ? (
    <>ERROR: {errorMessage}</>
  ) : (
    <>
      <Table
        columns={memoizedColumns}
        data={results}
        loading={isFetching}
        fetched={isFetched}
        pagination={{
          pagination,
          setPagination: (state) => {
            setPagination({
              ...pagination,
              ...state
            })
          }
        }}
      />
    </>
  )
}

export default TableContainer
