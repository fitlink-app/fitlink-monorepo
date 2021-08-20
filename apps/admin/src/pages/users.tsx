import { useState, useContext } from 'react'
import Dashboard from '../components/layouts/Dashboard'
import { AuthContext } from '../context/Auth.context'
import TableContainer from '../components/Table/TableContainer'
import { toDateCell } from '../components/Table/helpers'
import { User } from '@fitlink/api/src/modules/users/entities/user.entity'
import { AnimatePresence } from 'framer-motion'
import Drawer from '../components/elements/Drawer'
import EditUser from '../components/forms/EditUser'
import { timeout } from '../helpers/timeout'
import Input from '../components/elements/Input'

export default function UsersPage() {
  const [drawContent, setDrawContent] = useState<
    React.ReactNode | undefined | false
  >(false)
  const [warning, setWarning] = useState(false)
  const [wide, setWide] = useState(false)
  const [refresh, setRefresh] = useState(0)
  const [keyword, setKeyword] = useState('')

  const closeDrawer = (ms = 0) => async () => {
    if (ms) {
      await timeout(ms)
    }
    setRefresh(Date.now())
    setDrawContent(null)
  }

  const EditUserForm = (fields) => {
    setWarning(true)
    setWide(false)
    setDrawContent(<EditUser onSave={closeDrawer(1000)} current={fields} />)
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
        <span>{`${name ? name[0] : ''}`}</span>
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

  const handleUsernameSearch = async(search) => {
    setKeyword(search)
  }

  const { api } = useContext(AuthContext)

  return (
    <Dashboard title="Settings Users">
      <div className="flex ai-c jc-sb">
        <h1 className="light mb-0 mr-2">Manage users</h1>
        <Input
          className="input-large"
          inline={true}
          onChange={handleUsernameSearch}
          name="userSearch"
          placeholder="Enter name or email..."
          value=""
        />
      </div>
      <div className="mt-4 overflow-x-auto">
        <TableContainer
          columns={[
            { Header: ' ', accessor: 'avatar', Cell: showAvatar },
            { Header: 'Name', accessor: 'name' },
            { Header: 'Email', accessor: 'email' },
            {
              Header: 'Last login',
              accessor: 'last_login_at',
              Cell: toDateCell
            },
            { Header: 'Updated', accessor: 'updated_at', Cell: toDateCell },
            { Header: 'Created', accessor: 'created_at', Cell: toDateCell },
            { Header: ' ', Cell: cellActions }
          ]}
          fetch={(limit, page, query) =>
            api.list<User>('/users', {
              limit,
              page,
              query: query.q? { q: query.q } : { q: undefined }
            })
          }
          fetchName="users"
          refresh={refresh}
          keyword={keyword}
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
