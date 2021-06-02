import React, { useContext, useEffect } from 'react'
import { TableContainer } from '../components/Table/TableContainer'
import { toDateCell } from '../components/Table/helpers'
import { AuthContext } from '../context/Auth.context'
import { CellProps } from 'react-table'

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
  const auth = useContext(AuthContext)

  return (
    <TableContainer
      columns={[
        { Header: 'Name', accessor: 'name' },
        { Header: 'Timezone', accessor: 'timezone' },
        { Header: 'Type', accessor: 'type' },
        { Header: 'Type (Other)', accessor: 'type_other' },
        { Header: 'Updated At', accessor: 'updated_at', Cell: toDateCell },
        { Header: 'Created At', accessor: 'created_at', Cell: toDateCell },
        { Header: 'Total Users', accessor: 'user_count' },
        { Header: 'Actions', Cell: cellActions }
      ]}
      fetch={(limit = 10, page = 0, params = {}) =>
        Promise.resolve(require('../services/dummy/organisations.json'))
      }
    />
  )
}

export default Index
