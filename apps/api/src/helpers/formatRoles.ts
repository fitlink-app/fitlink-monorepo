import { JWTRoles } from '../../src/models'
import { UserRole } from '../../src/modules/user-roles/entities/user-role.entity'

export const formatRoles = (rolesFromDb: UserRole[]): JWTRoles => {
  const userRoles: JWTRoles = {
    o_a: [],
    t_a: [],
    s_a: [],
    spr: false
  }
  for (const value of rolesFromDb) {
    if (value.role === 'team_admin') {
      userRoles.t_a.push(value.team.id)
    }

    if (value.role === 'organisation_admin') {
      userRoles.o_a.push(value.organisation.id)
    }

    if (value.role === 'subscription_admin') {
      userRoles.s_a.push(value.subscription.id)
    }

    if (value.role === 'super_admin') {
      userRoles.spr = true
    }
  }

  return userRoles
}
