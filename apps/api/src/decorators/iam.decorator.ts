import { SetMetadata } from '@nestjs/common'
import { Roles } from '../modules/user-roles/user-roles.constants'

export const ROLES = 'roles'

/**
 * Example roles:
 * Roles.Self (give the user access to read their own resource)
 * Roles.TeamAdmin
 * Roles.OrganisationAdmin
 * Roles.SubscriptionAdmin
 *
 * For a role to work, it's corresponding parameter is required
 * in the URL scheme. E.g. Roles.TeamAdmin will throw a 500 error
 * if :teamId is not present in the controller path.
 *
 * @param allowed
 * @returns
 */
export const Iam = (role: Roles, ...roles: Roles[]) =>
  SetMetadata(ROLES, [role].concat(roles))
