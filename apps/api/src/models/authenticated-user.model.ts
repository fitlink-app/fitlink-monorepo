import { Roles } from '../modules/user-roles/entities/user-role.entity'

export type AuthenticatedUserRoles = {
  [Roles.OrganisationAdmin]: string[]
  [Roles.TeamAdmin]: string[]
  [Roles.SubscriptionAdmin]: string[]
  [Roles.SuperAdmin]: boolean
}

export class AuthenticatedUser {
  id: string
  roles: AuthenticatedUserRoles

  constructor(user: any) {
    this.id = user.id
    this.roles = user.roles
  }

  isTeamAdmin(teamId: string) {
    return this.roles.team_admin.includes(teamId)
  }

  isOrganisationAdmin(organisationId: string) {
    return this.roles.organisation_admin.includes(organisationId)
  }

  isSubscriptionAdmin(susbcriptionId: string) {
    return this.roles.subscription_admin.includes(susbcriptionId)
  }

  isSuperAdmin() {
    return this.roles.super_admin === true
  }
}
