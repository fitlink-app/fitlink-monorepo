import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { AuthenticatedUser } from '../models'
import { User } from '../modules/users/entities/user.entity'
import { Team } from '../modules/teams/entities/team.entity'
import { Entity } from 'typeorm'

export enum Access {
  UserRead = 'User.Read',
  UserWrite = 'User.Write',
  UserDelete = 'User.Delete'
}

@Injectable()
export class AccessInterceptor implements NestInterceptor {
  access: Access

  constructor(access: Access) {
    this.access = access
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest()
    const allow = validateBefore[this.access](request.user)
    if (!allow) {
      throw new HttpException('Access denied', HttpStatus.FORBIDDEN)
    }
    // console.log('Before...', this.access);
    // console.log(context)
    return next.handle().pipe(
      map((value) => {
        if (
          !isSuperAdmin(request.user) &&
          !validateAfter[this.access](value, request.user)
        ) {
          throw new HttpException('Access denied', HttpStatus.FORBIDDEN)
        } else {
          return value
        }
      })
    )
  }
}

export function isOrgAdmin(orgId: string, user: AuthenticatedUser) {
  return user.roles.org_admin.includes(orgId)
}

export function isTeamAdmin(teamId, user: AuthenticatedUser) {
  return user.roles.team_admin.includes(teamId)
}

export function isTeamOrOrgAdmin(team: Team, user: AuthenticatedUser) {
  return isTeamAdmin(team.id, user) || isOrgAdmin(team.organisation.id, user)
}

/**
 * Superadmin has read/write access to everything
 *
 * @param user
 * @returns
 */
export function isSuperAdmin(user: AuthenticatedUser) {
  return false
  // return user.roles.super_admin === true
}

/**
 * User is elevated to perform more tasks
 * than a typical mobile app user
 *
 * @param user
 * @returns
 */
export function isElevated(user: AuthenticatedUser) {
  return (
    user.roles.super_admin ||
    user.roles.org_admin.length > 0 ||
    user.roles.team_admin.length > 0
  )
}

/**
 * Validation functions to execute
 * before the entity is fetched
 */
const validateBefore = {
  [Access.UserRead](user: AuthenticatedUser) {
    return isElevated(user)
  },
  [Access.UserWrite](user: AuthenticatedUser) {
    // No one can write users except super admin
    // Because each user owns their own account
    return isSuperAdmin(user)
  },
  [Access.UserDelete](user: AuthenticatedUser) {
    return isSuperAdmin(user)
  }
}

/**
 * Validation functions to execute
 * after the entity is fetched
 */

const validateAfter = {
  [Access.UserRead](entity: User, user: AuthenticatedUser) {
    // if( !entity.teams ){
    //   throw new HttpException(
    //     "Teams needs to be eager-loaded on user entity",
    //     HttpStatus.INTERNAL_SERVER_ERROR
    //   )
    // }
    if (entity.id === user.id) {
      return true
    }

    if (entity.teams) {
      const managedInTeams = entity.teams.filter((team) => {
        // console.log( team, user.roles.org_admin )
        return isTeamOrOrgAdmin(team, user)
      })
      return managedInTeams.length > 0
    }
  }
}
