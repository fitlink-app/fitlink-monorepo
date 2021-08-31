import { AnimatePresence } from 'framer-motion'
import { useState, useContext, useEffect } from 'react'
import Drawer from '../components/elements/Drawer'
import CreateOrganisation from '../components/forms/CreateOrganisation'
import Dashboard from '../components/layouts/Dashboard'
import TableContainer from '../components/Table/TableContainer'
import { toDateCell, toOtherCell } from '../components/Table/helpers'
// eslint-disable-next-line @typescript-eslint/no-var-requires
import { AuthContext } from '../context/Auth.context'
import { Organisation } from '@fitlink/api/src/modules/organisations/entities/organisation.entity'
import { timeout } from '../helpers/timeout'
import ConfirmDeleteForm from '../components/forms/ConfirmDeleteForm'
import { Roles } from '../../../api/src/modules/user-roles/user-roles.constants'
import { useQuery } from 'react-query'
import { UserRole } from '../../../api/src/modules/user-roles/entities/user-role.entity'
import { useRouter } from 'next/router'

export default function OrganisationsPage() {
  const [drawContent, setDrawContent] = useState<
    React.ReactNode | undefined | false
  >(false)
  const { switchRole } = useContext(AuthContext)
  const [roles, setRoles] = useState<UserRole[]>([])
  const [ready, setReady] = useState(false)
  const router = useRouter()

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
        className="button small ml-1"
        onClick={() =>
          switchRole({
            id: original.id,
            role: original.role
          })
        }>
        Manage
      </button>
    </div>
  )

  const { api } = useContext(AuthContext)

  const rolesQuery = useQuery('me/roles', () =>
    api.get<UserRole[]>('/me/roles')
  )

  useEffect(() => {
    if (rolesQuery.isFetched) {
      if (rolesQuery.data.length === 1) {
        const data = rolesQuery.data[0]
        switch (data.role) {
          case Roles.SubscriptionAdmin:
            router.push('/billing')
            break
          default:
            router.push('/dashboard')
        }
      } else {
        setRoles(rolesQuery.data)
        setReady(true)
      }
    }
  }, [rolesQuery.data])

  if (!ready) {
    return null
  }

  return (
    <Dashboard title="Settings Users" hideSidebar={true}>
      <div className="flex jc-c">
        <div className="w-100">
          <div className="col-12 jc-c">
            <h1 className="light mb-0 mr-2">Choose what to manage</h1>
          </div>

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
                const roles = await api.get<UserRole[]>('/me/roles')
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
              fetchName="my_roles"
              refresh={0}
            />
          </div>
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
