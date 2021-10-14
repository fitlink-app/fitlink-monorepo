import { useContext, useEffect, useState } from 'react'
import { useQuery } from 'react-query'
import { UserRole } from '@fitlink/api/src/modules/user-roles/entities/user-role.entity'
import { AuthContext } from '../../context/Auth.context'
import { Roles } from '@fitlink/api/src/modules/user-roles/user-roles.constants'

export default function useRoles(key = 'switcher') {
  const { api, fetchKey } = useContext(AuthContext)
  const [roles, setRoles] = useState<
    {
      type: string
      role: Roles
      name: string
      id: string
    }[]
  >([])

  const rolesQuery = useQuery(`start_roles_${fetchKey}_${key}`, () =>
    api.get<UserRole[]>('/me/roles')
  )

  useEffect(() => {
    if (rolesQuery.isFetched) {
      setRoles(withFormat(rolesQuery.data || []))
    }
  }, [rolesQuery.isFetched])

  function withFormat(roles: UserRole[]) {
    return roles.map((each) => ({
      type: formatRoles[each.role],
      role: each.role,
      name: getDescriptiveName(each),
      id: getId(each)
    }))
  }

  return { roles }
}

const formatRoles = {
  [Roles.OrganisationAdmin]: 'Organisation',
  [Roles.TeamAdmin]: 'Team',
  [Roles.SubscriptionAdmin]: 'Subscription',
  [Roles.SuperAdmin]: 'Super Admin'
}

const getDescriptiveName = (role: UserRole) => {
  if (role.subscription) {
    return (
      role.subscription.billing_entity +
      ' (' +
      role.subscription.organisation.name +
      ')'
    )
  }
  if (role.team) {
    return role.team.name
  }
  if (role.organisation) {
    return role.organisation.name + ' (' + role.organisation.type + ')'
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
