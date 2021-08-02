import { useState, useContext } from 'react'
import Dashboard from '../components/layouts/Dashboard'
import { AuthContext } from '../context/Auth.context'
import TableContainer from '../components/Table/TableContainer'
import { toDateCell } from '../components/Table/helpers'
import { User } from '@fitlink/api/src/modules/users/entities/user.entity'
import { AnimatePresence } from 'framer-motion'
import Drawer from '../components/elements/Drawer'
import EditUser from '../components/forms/EditUser'

export default function UsersPage() {
  const [drawContent, setDrawContent] = useState<
    React.ReactNode | undefined | false
  >(false)
  const [warning, setWarning] = useState(false)
  const [wide, setWide] = useState(false)

  const EditUserForm = (fields) => {
    setWarning(true)
    setWide(false)
    setDrawContent(<EditUser current={fields} />)
  }

  const showAvatar = ({
    cell: {
      row: {
        original: { avatar, name }
      }
    }
  }) => {
    return (
      <div className="avatar">
        <span>
          {
            `${
              name
              ? name[0]
              : ''
            }`
          }
        </span>
        {avatar && <img src={avatar.url_128x128} alt={name} />}
      </div>
    )
  }

  const cellActions = ({
    cell: {
      row: { original }
    }
  }) => (
    <div className="text-right">
      <button
        className="button small ml-1"
        onClick={() => EditUserForm(original)}>
        Edit
      </button>
    </div>
  )

  const { api } = useContext(AuthContext)

  return (
    <Dashboard title="Settings Users">
      <div className="flex ai-c">
        <h1 className="light mb-0 mr-2">Manage users</h1>
      </div>
      <div className="mt-4 overflow-x-auto">
        <TableContainer
          columns={[
            { Header: ' ', accessor: 'avatar', Cell: showAvatar },
            { Header: 'Name', accessor: 'name' },
            { Header: 'Email', accessor: 'email' },
            { Header: 'Last login', accessor: 'last_login_at', Cell: toDateCell },
            { Header: 'Updated', accessor: 'updated_at', Cell: toDateCell },
            { Header: 'Created', accessor: 'created_at', Cell: toDateCell },
            { Header: ' ', Cell: cellActions }
          ]}
          fetch={(limit, page) =>
            api.list<User>('/users', {
              limit,
              page
            })
          }
          fetchName="users"
          // fetch={(limit = 10, page = 0, params = {}) => {
          //   if (page !== currentPage) {
          //     setCurrentPage(page)
          //   }
          //   return Promise.resolve(data)
          // }}
          // fetchName="example"
        />
      </div>

      <AnimatePresence initial={false}>
        {drawContent && (
          <Drawer
            remove={() => setDrawContent(null)}
            key="drawer"
            warnBeforeClose={warning}
            wide={wide}>
            {drawContent}
          </Drawer>
        )}
      </AnimatePresence>
    </Dashboard>
  )
}