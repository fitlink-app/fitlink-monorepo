import React, { useContext, useState } from 'react'
import { TableContainer } from '../components/Table/TableContainer'
import { toDateCell } from '../components/Table/helpers'
import { AuthContext } from '../context/Auth.context'
import { CellProps } from 'react-table'
import { useQuery } from 'react-query'
import { User } from '../../../api/src/modules/users/entities/user.entity'

const cellActions = ({
  cell: {
    row: {
      original: { id }
    }
  }
}: CellProps<any, any>) => (
  <>
    <button onClick={() => alert(id)}>Delete</button>
    <button onClick={() => alert(id)}>Edit</button>
  </>
)

const Index = () => {
  const { api } = useContext(AuthContext)
  const [currentPage, setCurrentPage] = useState(0)

  const fetchUsers = (page = 0, limit = 10) =>
    api.list<User>('/users', { page, limit })

  const { isLoading, data } = useQuery(
    ['users', currentPage],
    () => fetchUsers(currentPage),
    {
      keepPreviousData: true
    }
  )

  if (isLoading) {
    return null
  }

  return (
    <TableContainer
      columns={[
        { Header: 'Name', accessor: 'name' },
        { Header: 'Timezone', accessor: 'timezone' },
        { Header: 'Updated At', accessor: 'updated_at', Cell: toDateCell },
        { Header: 'Created At', accessor: 'created_at', Cell: toDateCell },
        { Header: 'Actions', Cell: cellActions }
      ]}
      fetch={(limit = 10, page = 0, params = {}) => {
        if (page !== currentPage) {
          setCurrentPage(page)
        }
        return Promise.resolve(data)
      }}
    />
  )
}

export default Index
