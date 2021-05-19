import React, { useMemo, useCallback, useState, useEffect } from 'react'
import { Table, TablePagination } from './Table'
import { Column } from 'react-table'

export type TableContainerProps = {
  columns: Column<any>[]
  fetch: (
    limit: number,
    page: number,
    params: NodeJS.Dict<any>
  ) => Promise<{
    results: any[]
    total: number
    page_total: number
  }>
}

export function TableContainer({ columns, fetch }: TableContainerProps) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [refresh, setRefresh] = useState(0)

  const [pagination, setPagination] = useState<TablePagination>({
    page: 0,
    pageCount: 0,
    pageTotal: 0,
    total: 0,
    limit: 10
  })

  const memoizedColumns = useMemo(() => columns, [])
  const memoizedData = useMemo(() => data, [data])

  const fetchData = useCallback(() => {
    ;(async function () {
      setLoading(true)

      const { limit, page } = pagination
      const { results, total, page_total } = await fetch(limit, page, {})

      setPagination({
        ...pagination,
        pageCount: Math.ceil(total / limit),
        pageTotal: page_total,
        total
      })
      setData(results)
      setLoading(false)
    })()
  }, [refresh])

  useEffect(() => {
    console.log(pagination)
    fetchData()
  }, [refresh])

  return (
    <Table
      columns={memoizedColumns}
      data={memoizedData}
      loading={loading}
      pagination={{
        pagination,
        setPagination: (state) => {
          setPagination({
            ...pagination,
            ...state
          })
          setRefresh(refresh + 1)
        }
      }}
    />
  )
}

export default TableContainer
