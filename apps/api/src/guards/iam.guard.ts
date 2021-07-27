import {
  Injectable,
  CanActivate,
  ExecutionContext,
  InternalServerErrorException
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ROLES } from '../decorators/iam.decorator'
import { Roles } from '../modules/user-roles/user-roles.constants'
import { AuthenticatedUser } from '../models/authenticated-user.model'

@Injectable()
export class IamGuard implements CanActivate {
  static accessMap = {
    [Roles.OrganisationAdmin]: 'organisationId',
    [Roles.TeamAdmin]: 'teamId',
    [Roles.SubscriptionAdmin]: 'subscriptionId',
    [Roles.Self]: 'userId'
  }

  constructor(private readonly reflector: Reflector) {}

  /**
   * For role checking to work, a URL should look something like the following
   * /organisations/:organisationId/user/:userId
   * /subscriptions/:subscriptionId
   * /teams/:teamId/user/:userId
   * /users/:userId
   * /teams/:teamId/activities
   *
   * This allows resources to be checked against the user's JWT without
   * making calls to the database.
   *
   * @param context
   * @returns
   */

  canActivate(context: ExecutionContext): boolean {
    let allow = false
    const request = context.switchToHttp().getRequest()
    const rolesAllowed = this.reflector.get<Roles[]>(
      ROLES,
      context.getHandler()
    )

    if (!rolesAllowed) {
      return true
    }

    rolesAllowed.map((role: Roles) => {
      if (!Object.values(Roles).includes(role)) {
        throw new InternalServerErrorException(`Role ${role} does not exist`)
      }

      if (!allow) {
        allow = IamGuard.checkRole(IamGuard.accessMap[role], role, request)
      }
    })

    return allow
  }

  /**
   * Checks that a role matches the requested parameters
   *
   * @param parameter
   * @param role
   * @param request
   * @returns
   */
  static checkRole(parameter: string, role: Roles, request): boolean {
    const user = request.user as AuthenticatedUser

    if (role === Roles.SuperAdmin) {
      return user.roles.super_admin === true
    }

    // Role cannot be assigned without explicitly adding the parameter to the controller
    if (!request.params[parameter]) {
      return false
    }

    // Users can edit entities they own
    if (role === Roles.Self && user.id === request.params.userId) {
      return true
    } else {
      return user.roles[role].includes(request.params[parameter])
    }
  }
}
