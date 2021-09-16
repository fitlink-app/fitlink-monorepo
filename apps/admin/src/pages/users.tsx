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
import useDebounce from '../hooks/useDebounce'
import ConfirmForm from '../components/forms/ConfirmForm'
import InviteUserForm from '../components/forms/InviteUserForm'
import { Roles } from '../../../api/src/modules/user-roles/user-roles.constants'

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
  }) => {
    const { focusRole } = useContext(AuthContext)

    return (
      <div className="text-right">
        {focusRole === 'app' && (
          <button
            className="button small ml-1"
            onClick={() => EditUserForm(original)}>
            Edit
          </button>
        )}
        {focusRole === 'team' && (
          <button
            className="button small ml-1"
            onClick={() => ConfirmRemoveForm(original)}>
            Remove
          </button>
        )}
      </div>
    )
  }

  const ConfirmRemoveForm = (fields) => {
    setWarning(true)
    setWide(false)
    setDrawContent(
      <ConfirmForm
        onUpdate={closeDrawer(1000)}
        onCancel={closeDrawer()}
        current={fields}
        title="Remove"
        updateText="Removing..."
        completedText="Removed"
        message={`
          Are you sure you want to remove this user from your team?
          Note they will also lose access to all leagues, rewards and other content
          within this team.
        `}
        mutation={(current) =>
          api.delete('/teams/:teamId/users/:userId', {
            userId: current.id,
            teamId: primary.team
          })
        }
      />
    )
  }

  const handleUsernameSearch = async (search) => {
    setKeyword(search)
  }

  const dbSearchTerm = useDebounce(keyword, 500)
  const { api, fetchKey, focusRole, primary } = useContext(AuthContext)

  const InviteTeamMemberForm = () => {
    setWarning(true)
    setWide(false)
    setDrawContent(
      <InviteUserForm
        role={Roles.Self}
        teamId={primary.team}
        onSave={closeDrawer(1000)}
      />
    )
  }

  return (
    <Dashboard title="Settings Users">
      <div className="flex ai-c jc-sb">
        <div className="flex ai-c">
          <h1 className="light mb-0 mr-2">Manage users</h1>

          {focusRole === 'team' && (
            <button
              className="button alt small mt-1"
              onClick={InviteTeamMemberForm}>
              Invite User
            </button>
          )}
        </div>

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
            /**
             * Note that the organisation or team
             * is inferred using role prefix.
             *
             * /users
             * /organisations/:organisationId/users
             * /teams/:teamId/users
             */
            api.list<User>(
              '/users',
              {
                limit,
                page,
                query
              },
              {
                primary,
                useRole: focusRole
              }
            )
          }
          fetchName={`users_${fetchKey}`}
          refresh={refresh}
          keyword={dbSearchTerm}
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
