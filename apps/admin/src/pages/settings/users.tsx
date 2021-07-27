import { AnimatePresence } from 'framer-motion'
import { useState, useContext } from 'react'
import Drawer from '../../components/elements/Drawer'
import InviteUser from '../../components/forms/InviteUser'
import ImportUsers from '../../components/forms/ImportUsers'
import Dashboard from '../../components/layouts/Dashboard'
import TableContainer from '../../components/Table/TableContainer'
import { boolToIcon, toDateCell } from '../../components/Table/helpers'
// eslint-disable-next-line @typescript-eslint/no-var-requires
import { AuthContext } from '../../context/Auth.context'
import { User } from '../../../../api/src/modules/users/entities/user.entity'
const dummy = require('../../services/dummy/team-users.json')

export default function components() {
  const [drawContent, setDrawContent] = useState<
    React.ReactNode | undefined | false
  >(false)
  const [warning, setWarning] = useState(false)
  const [wide, setWide] = useState(false)

  const InviteUserForm = () => {
    setWarning(true)
    setWide(false)
    setDrawContent(<InviteUser />)
  }

  const EditUserForm = (firstName, lastName, email) => {
    setWarning(true)
    setWide(false)
    setDrawContent(
      <InviteUser
        current={{ firstName: firstName, lastName: lastName, email: email }}
      />
    )
  }

  const ImportUsersForm = () => {
    setWarning(true)
    setWide(true)
    setDrawContent(<ImportUsers />)
  }

  const showAvatar = ({
    cell: {
      row: {
        original: { avatar, name }
      }
    }
  }) => {
    console.log(avatar)
    let [firstName, lastName] = (name || '?').split(' ')
    lastName = lastName || ' '
    return (
      <div className="avatar">
        <span>{`${firstName[0]}${lastName[0]}`}</span>
        {avatar && <img src={avatar.url_128x128} alt={name} />}
      </div>
    )
  }

  const cellActions = ({
    cell: {
      row: {
        original: { firstName, lastName, email }
      }
    }
  }) => (
    <div className="text-right">
      <button className="button alt small">Delete</button>
      <button
        className="button small ml-1"
        onClick={() => EditUserForm(firstName, lastName, email)}>
        Edit
      </button>
    </div>
  )

  const { api } = useContext(AuthContext)

  return (
    <Dashboard title="Settings Users">
      <div className="flex ai-c">
        <h1 className="light mb-0 mr-2">Manage users</h1>
        <button className="button alt small mt-1" onClick={InviteUserForm}>
          Invite
        </button>
        <button
          className="button alt small mt-1 ml-1"
          onClick={ImportUsersForm}>
          Bluk import
        </button>
      </div>

      <div className="mt-4 overflow-x-auto">
        <TableContainer
          columns={[
            { Header: ' ', accessor: 'avatar', Cell: showAvatar },
            { Header: 'Name', accessor: 'name' },
            { Header: 'Email', accessor: 'email' },
            {
              Header: 'Email Verified',
              accessor: 'email_verified',
              Cell: boolToIcon
            },
            { Header: 'Joined', accessor: 'created_at', Cell: toDateCell },
            { Header: ' ', Cell: cellActions }
          ]}
          fetch={(limit, page, params) => {
            return api.list<User>('/users', {
              limit,
              page,
              params
            })
          }}
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