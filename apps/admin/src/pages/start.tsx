import { useRef, useState, useContext, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Dashboard from '../components/layouts/Dashboard'
import TableContainer from '../components/Table/TableContainer'
import { AuthContext } from '../context/Auth.context'
import { Roles } from '@fitlink/api/src/modules/user-roles/user-roles.constants'
import { useQuery } from 'react-query'
import { UserRole } from '@fitlink/api/src/modules/user-roles/entities/user-role.entity'
import LoaderFullscreen from '../components/elements/LoaderFullscreen'
import toast from 'react-hot-toast'
import { timeout } from '../helpers/timeout'

export default function StartPage() {
  const {
    api,
    fetchKey,
    switchRole,
    setModeRole,
    setFocusRole,
    modeRole
  } = useContext(AuthContext)
  const [roles, setRoles] = useState<UserRole[]>([])
  const [refresh, setRefresh] = useState(0)
  const router = useRouter()
  const roleSet = useRef<boolean>(false)

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
      <button
        className="button small ml-1 pointer"
        onClick={async () => {
          toast.loading(<b>Switching role...</b>)
          switchRole({
            id: original.id,
            role: original.role
          }).finally(() => {
            toast.dismiss()
          })
        }}>
        Manage
      </button>
    </div>
  )

  const rolesQuery = useQuery(
    `start_roles_${fetchKey}`,
    () => api.get<UserRole[]>('/me/roles'),
    {
      cacheTime: 0
    }
  )

  useEffect(() => {
    if (rolesQuery.isSuccess) {
      const data = rolesQuery.data
      setRefresh(Date.now())
      setRoles(data || [])
      if (data.length === 1) {
        setDefaultRole()
      }
      if (data.length === 0) {
        setUserRole()
      }
    }
  }, [rolesQuery.isFetched, modeRole, rolesQuery.data])

  async function setDefaultRole() {
    if (!roleSet.current) {
      roleSet.current = true
      await timeout(100)
      await switchRole({
        id: getId(rolesQuery.data[0]),
        role: rolesQuery.data[0].role
      })
    }
  }

  async function setUserRole() {
    if (!roleSet.current) {
      roleSet.current = true
      setModeRole('user')
      setFocusRole('user')
    }
  }

  if (!rolesQuery.isFetched) {
    return <Dashboard title="Start" hideSidebar={true} loading={true} />
  }

  if (roles.length === 1) {
    return <Dashboard title="Start" hideSidebar={true} loading={true} />
  }

  return (
    <Dashboard title="Settings Users" hideSidebar={true} forceDisplay={true}>
      <div className="flex jc-c ai-c">
        <div className="w-100">
          <div className="flex ai-c jc-c">
            <h1 className="light mb-0 mr-2">Choose what to manage</h1>
            <Link href="/logout">
              <button className="button alt small mt-1">Logout</button>
            </Link>
            <Link href="/settings/profile">
              <button className="button small ml-1 mt-1">My Profile</button>
            </Link>
          </div>

          {!roles.length && (
            <div className="flex ai-c jc-c mt-4">
              <p className="w-50">
                This dashboard is for administrators. If you require access
                please contact your organisation administrator. <br />
                <br />
                Alternatively, you can{' '}
                <Link href="/signup?u=1" passHref>
                  <a className="color-primary">Start a free trial</a>
                </Link>
                .
              </p>
            </div>
          )}

          {!!roles.length && (
            <div className="col-12 mt-4 overflow-x-auto w-100">
              <TableContainer
                hidePagination={true}
                columns={[
                  {
                    Header: 'Type',
                    accessor: 'type'
                  },
                  {
                    Header: 'Name',
                    accessor: 'name'
                  },
                  { Header: ' ', Cell: cellActions }
                ]}
                fetch={async function () {
                  return Promise.resolve({
                    results: roles.map((each) => ({
                      type: formatRoles[each.role],
                      role: each.role,
                      name: getDescriptiveName(each),
                      id: getId(each)
                    })),
                    total: roles.length,
                    page_total: roles.length
                  })
                }}
                fetchName={`start_roles_${fetchKey}_${refresh}`}
                refresh={refresh}
                nullMessage="Nothing to manage yet."
              />
            </div>
          )}
        </div>
      </div>
    </Dashboard>
  )
}

const formatRoles = {
  [Roles.OrganisationAdmin]: 'Organisation',
  [Roles.TeamAdmin]: 'Team',
  [Roles.SubscriptionAdmin]: 'Subscription',
  [Roles.SuperAdmin]: 'Super Admin'
}

const getDescriptiveName = (role: UserRole) => {
  if (role.subscription) {
    return role.subscription.billing_entity
  }
  if (role.team) {
    return role.team.name
  }
  if (role.organisation) {
    return role.organisation.name
  }

  // Superadmin
  return 'Fitlink Global'
}

const getId = (role: UserRole) => {
  if (role.subscription) {
    return role.subscription.id
  }
  if (role.team) {
    return role.team.id
  }
  if (role.organisation) {
    return role.organisation.id
  }
}
