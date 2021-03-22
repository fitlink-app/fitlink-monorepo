import { Roles } from '../modules/user-roles/entities/user-role.entity'

export type AuthenticatedUserRoles = {
  [Roles.OrganisationAdmin]: string[]
  [Roles.TeamAdmin]: string[]
  [Roles.SubscriptionAdmin]: string[]
  [Roles.SuperAdmin]: boolean
}

export type AuthenticatedUser = {
  id: string
  roles: AuthenticatedUserRoles
}
