import React, { useEffect, useState } from 'react'
import { useTable, usePagination, Column, useSortBy } from 'react-table'
import IconArrowLeft from '../icons/IconArrowLeft'
import IconArrowLeftDouble from '../icons/IconArrowLeftDouble'
import IconArrowRight from '../icons/IconArrowRight'
import IconArrowRightDouble from '../icons/IconArrowRightDouble'
import IconArrowUp from '../icons/IconArrowUp'
import IconArrowDown from '../icons/IconArrowDown'

export type TableProps = {
  columns: Column<any>[]
  data: any[]
  loading: boolean
  pagination: {
    pagination: TablePagination
    setPagination: (pagination: Partial<TablePagination>) => void
  }
}

export type TablePagination = {
  page: number
  pageCount: number
  pageTotal: number
  total: number
  limit: number
}

export function Table({
  columns,
  data,
  loading,
  pagination: { pagination, setPagination }
}: TableProps) {
  const { pageTotal, limit, total } = pagination
  const offset = pagination.page * limit
  const controlledPageCount = pagination.pageCount

  const {
    page,
    canPreviousPage,
    canNextPage,
    pageCount,
    headerGroups,
    state: { pageIndex, pageSize },
    getTableProps,
    getTableBodyProps,
    prepareRow,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize
  } = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: 0, pageSize: limit },
      manualPagination: true,
      pageCount: controlledPageCount
    },
    useSortBy,
    usePagination
  )

  useEffect(() => {
    if (pageIndex !== pagination.page || pageSize !== pagination.limit) {
      setPagination({
        page: pageIndex,
        limit: pageSize
      })
    }
  }, [pageIndex, pageSize])

  // Render the UI for your table
  return (
    <>
      <table className="react-table" {...getTableProps()}>
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                  {column.render('Header')}

                  {!column.disableSortBy && (
                    <span
                      style={{
                        display: 'inline-block',
                        width: 16,
                        height: 16,
                        marginLeft: 4,
                        verticalAlign: 'top'
                      }}>
                      {column.isSorted ? (
                        column.isSortedDesc ? (
                          <IconArrowDown />
                        ) : (
                          <IconArrowUp />
                        )
                      ) : (
                        ''
                      )}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {page.map((row, i) => {
            prepareRow(row)
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map((cell) => {
                  return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                })}
              </tr>
            )
          })}
          <tr>
            {loading ? (
              // Use our custom loading state to show a loading indicator
              <td colSpan={10000}>Loading...</td>
            ) : (
              <td colSpan={10000}>
                Showing {offset} - {offset + pageTotal} of ~{total} results
              </td>
            )}
          </tr>
        </tbody>
      </table>
      {/*
        Pagination can be built however you'd like.
        This is just a very basic UI implementation:
      */}
      <div className="pagination">
        <button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
          <IconArrowLeftDouble />
        </button>{' '}
        <button onClick={() => previousPage()} disabled={!canPreviousPage}>
          <IconArrowLeft />
        </button>{' '}
        <button onClick={() => nextPage()} disabled={!canNextPage}>
          <IconArrowRight />
        </button>{' '}
        <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
          <IconArrowRightDouble />
        </button>{' '}
        <span>
          Page{' '}
          <strong>
            {pageIndex + 1} of {controlledPageCount}
          </strong>{' '}
        </span>
        <span>
          Go to page:{' '}
          <input
            type="number"
            defaultValue={pageIndex + 1}
            onChange={(e) => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0
              gotoPage(page)
            }}
            style={{ width: '100px' }}
          />
        </span>{' '}
        <select
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value))
          }}>
          {[10, 20, 30, 40, 50].map((pageSize) => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize}
            </option>
          ))}
        </select>
      </div>
    </>
  )
}

export default Table
