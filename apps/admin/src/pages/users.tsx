import { useEffect, useState, useContext } from 'react'
import Dashboard from '../components/layouts/Dashboard'
import { AuthContext } from '../context/Auth.context'
import TableContainer from '../components/Table/TableContainer'
import { boolToIcon, toDateCell } from '../components/Table/helpers'
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
import { ProviderTypeDisplay } from '@fitlink/api/src/modules/providers/providers.constants'
import IconMobile from '../components/icons/IconMobile'
import IconInfo from '../components/icons/IconInfo'
import IconTrash from '../components/icons/IconTrash'
import IconMessage from '../components/icons/IconMessage'
import UserDetail, { UserDetailType } from '../components/forms/UserDetail'

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

  const showProviders = ({ value }) => {
    return (
      <>
        {!!value.length &&
          value.map((p) => ProviderTypeDisplay[p.type]).join(', ')}
        {!value.length && boolToIcon({ value: !!value.length })}
      </>
    )
  }

  const cellActions = ({
    cell: {
      row: { original }
    }
  }) => {
    const { modeRole, mode } = useContext(AuthContext)

    return (
      <div className="text-right flex jc-e">
        {modeRole === 'app' && (
          <button
            className="button small ml-2"
            onClick={() => EditUserForm(original)}>
            Edit
          </button>
        )}
        {modeRole === 'team' && (
          <button
            className="ml-2 icon-button color-red"
            onClick={() => ConfirmRemoveForm(original)}>
            <IconTrash />
          </button>
        )}
        {modeRole === 'team' && (
          <button
            className="ml-2 icon-button color-primary"
            onClick={() => MessageUserForm(original, 'app_activity_info')}>
            <IconMobile viewBox={'0 0 320 512'} />
          </button>
        )}
        {modeRole === 'team' && (
          <button
            className="ml-2 icon-button color-primary"
            onClick={() => MessageUserForm(original, 'app_system_info')}>
            <IconInfo viewBox={'0 0 512 512'} />
          </button>
        )}
        {modeRole === 'team' && (
          <button
            className="ml-2 icon-button color-primary"
            onClick={() => MessageUserForm(original, 'message_user')}>
            <IconMessage viewBox={'0 0 512 512'} />
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

  const MessageUserForm = (fields, type: UserDetailType) => {
    setWarning(true)
    setWide(false)
    setDrawContent(
      <UserDetail onSave={closeDrawer(1000)} current={fields} type={type} />
    )
  }

  const handleUsernameSearch = async (search) => {
    setKeyword(search)
  }

  const dbSearchTerm = useDebounce(keyword, 500)
  const { api, fetchKey, focusRole, modeRole, primary, mode } = useContext(
    AuthContext
  )

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

  const [columns, setColumns] = useState<any[]>([
    { Header: ' ', accessor: 'avatar', Cell: showAvatar },
    { Header: 'Name', accessor: 'name' },
    { Header: 'Email', accessor: 'email' },
    { Header: ' ', Cell: cellActions }
  ])

  useEffect(() => {
    if (modeRole === 'app' && columns.length === 4) {
      const cols = [...columns]
      const actions = cols[3]

      cols[3] = {
        Header: 'Joined',
        accessor: 'created_at',
        Cell: toDateCell
      }

      cols[4] = actions

      setColumns(cols)
    }
  }, [modeRole])

  return (
    <Dashboard title="Settings Users">
      <div className="flex ai-c jc-sb">
        <div className="flex ai-c">
          <h1 className="light mb-0 mr-2">Manage users</h1>

          {modeRole === 'team' && (
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
          key={columns.length}
          columns={columns}
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
                useRole: modeRole
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
