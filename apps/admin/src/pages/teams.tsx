import { AnimatePresence } from 'framer-motion'
import { useState, useContext, useRef, useEffect } from 'react'
import Drawer from '../components/elements/Drawer'
import CreateTeam from '../components/forms/CreateTeam'
import Dashboard from '../components/layouts/Dashboard'
import TableContainer from '../components/Table/TableContainer'
import { toDateCell } from '../components/Table/helpers'
import { AuthContext } from '../context/Auth.context'
import { Team } from '@fitlink/api/src/modules/teams/entities/team.entity'
import { timeout } from '../helpers/timeout'
import ConfirmDeleteForm from '../components/forms/ConfirmDeleteForm'
import { Roles } from '@fitlink/api/src/modules/user-roles/user-roles.constants'
import { useRouter } from 'next/router'
import { RoleContext } from '../context/Role.context'
import toast from 'react-hot-toast'

export default function TeamsPage() {
  const [drawContent, setDrawContent] = useState<
    React.ReactNode | undefined | false
  >(false)
  const [warning, setWarning] = useState(false)
  const [wide, setWide] = useState(false)
  const [refresh, setRefresh] = useState(0)
  const { switchRole, primary } = useContext(AuthContext)
  const { organisation } = useContext(RoleContext)
  const router = useRouter()

  const closeDrawer = (ms = 0) => async () => {
    if (ms) {
      await timeout(ms)
    }
    setRefresh(Date.now())
    setDrawContent(null)
  }

  const CreateTeamForm = () => {
    setWarning(true)
    setWide(false)
    setDrawContent(
      <CreateTeam
        organisationId={organisation.current}
        onSave={closeDrawer(1000)}
      />
    )
  }

  const EditTeamForm = (fields) => {
    setWarning(true)
    setWide(false)
    setDrawContent(
      <CreateTeam
        onSave={closeDrawer(1000)}
        organisationId={organisation.current}
        current={fields}
      />
    )
  }

  const DeleteForm = (fields) => {
    setWarning(true)
    setWide(false)
    setDrawContent(
      <ConfirmDeleteForm
        onDelete={closeDrawer(1000)}
        onCancel={closeDrawer()}
        current={fields}
        mutation={(id) =>
          api.delete('/organisations/:organisationId/teams/:teamId', {
            teamId: id,
            organisationId: organisation.current
          })
        }
        title="Delete team"
        requireConfirmText="DELETE"
        message={`
          Are you sure you want to delete this team?
          This will permanently remove all associated rewards, leagues, activities & more.
        `}
      />
    )
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
        <span>{`${name[0]}`}</span>
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
      <button className="button alt small" onClick={() => DeleteForm(original)}>
        Delete
      </button>
      <button
        className="button small ml-1"
        onClick={() => {
          router.push(`/teams/${original.id}/admins`)
        }}>
        Admins
      </button>
      <button
        className="button small ml-1"
        onClick={() => {
          toast.loading(<b>Switching role...</b>)
          switchRole({
            id: original.id,
            role: Roles.TeamAdmin
          }).finally(() => {
            toast.dismiss()
          })
        }}>
        Manage Team
      </button>
      <button
        className="button small ml-1"
        onClick={() => EditTeamForm(original)}>
        Edit
      </button>
    </div>
  )

  const { api, focusRole, fetchKey } = useContext(AuthContext)

  if (focusRole === 'team') {
    return null
  }

  return (
    <Dashboard title="Teams">
      <div className="flex ai-c">
        <h1 className="light mb-0 mr-2">Manage teams</h1>
        <button className="button alt small mt-1" onClick={CreateTeamForm}>
          Create New Team
        </button>
      </div>

      <div className="mt-4 overflow-x-auto">
        <TableContainer
          columns={[
            { Header: ' ', accessor: 'avatar', Cell: showAvatar },
            { Header: 'Name', accessor: 'name' },
            { Header: 'Users', accessor: 'user_count' },
            { Header: 'Created', accessor: 'created_at', Cell: toDateCell },
            { Header: 'Updated', accessor: 'updated_at', Cell: toDateCell },
            { Header: ' ', Cell: cellActions }
          ]}
          fetch={(limit, page) => {
            if (focusRole) {
              return api.list<Team>(
                '/teams',
                {
                  limit,
                  page
                },
                {
                  primary,
                  useRole: focusRole
                }
              )
            }

            return Promise.resolve({
              results: [],
              page_total: 0,
              total: 0
            })
          }}
          fetchName={`teams_${fetchKey}`}
          refresh={refresh}
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
