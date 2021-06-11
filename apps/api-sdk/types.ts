import { CreateOrganisationDto } from '@fitlink/api/src/modules/organisations/dto/create-organisation.dto'
import { UpdateOrganisationDto } from '@fitlink/api/src/modules/organisations/dto/update-organisation.dto'
import { CreateTeamDto } from '@fitlink/api/src/modules/teams/dto/create-team.dto'
import { UpdateTeamDto } from '@fitlink/api/src/modules/teams/dto/update-team.dto'
import { Activity } from '@fitlink/api/src/modules/activities/entities/activity.entity'
import { CreateActivityDto } from '@fitlink/api/src/modules/activities/dto/create-activity.dto'
import { UpdateActivityDto } from '@fitlink/api/src/modules/activities/dto/update-activity.dto'
import { Organisation } from '@fitlink/api/src/modules/organisations/entities/organisation.entity'
import { Team } from '@fitlink/api/src/modules/teams/entities/team.entity'
import {
  AuthLoginDto,
  AuthRefreshDto
} from '@fitlink/api/src/modules/auth/dto/auth-login'
import {
  AuthResultDto,
  AuthLogoutDto
} from '@fitlink/api/src/modules/auth/dto/auth-result'
// import { User } from '@fitlink/api/src/modules/users/entities/user.entity'

export type { AuthResultDto, AuthLogoutDto, AuthLoginDto }

type Payload<T> = NodeJS.Dict<any> & {
  payload?: T
}

type FilePayload = NodeJS.Dict<any> & {
  payload: FormData
}

export type AuthLogin = '/auth/login'
export type AuthLogout = '/auth/logout'
export type AuthRefresh = '/auth/refresh'
export type CreatableResource = AuthLogin | AuthLogout | AuthRefresh

export type ListResource =
  | '/organisations'
  | '/organisations/:organisationId/activities'
  | '/organisations/:organisationId/teams'
  | '/organisations/:organisationId/subscriptions'
  | '/organisations/:organisationId/invitations'
  | '/organisations/:organisationId/rewards'
  | '/organisations/:organisationId/leagues'
  | '/organisations/:organisationId/leagues/:leagueId/leaderboards'
  | '/teams/:teamId/activities'
  | '/teams/:teamId/invitations'
  | '/teams/:teamId/rewards'
  | '/teams/:teamId/rewards/:rewardId/redemptions'
  | '/teams/:teamId/users'
  | '/teams/:teamId/users/:userId/roles'
  | '/teams/:teamId/leagues'
  | '/teams/:teamId/leagues/:leagueId/leaderboards'
  | '/users'
  | '/activities'
  | '/rewards'
  | '/rewards/:rewardId/redemptions'
  | '/queue'
  | '/sports'
  | '/subscriptions'
  | '/users-invitations'
  | '/leagues'
  | '/me'
  | '/me/activities'
  | '/me/teams'
  | '/me/invitations'
  | '/me/rewards'
  | '/me/leagues'
  | '/me/followers'
  | '/me/following'
  | '/me/settings'
  | '/me/roles'
  | '/me/providers'
  | '/me/goals'
  | '/me/feed'

export type ReadResource =
  | '/organisations/:organisationId'
  | '/organisations/:organisationId/activities/:activityId'
  | '/organisations/:organisationId/teams/:teamId'
  | '/organisations/:organisationId/subscriptions/:subscriptionId'
  | '/organisations/:organisationId/invitations/:invitationId'
  | '/organisations/:organisationId/leagues/:leagueId'
  | '/teams/:teamId'
  | '/teams/:teamId/activities/:activityId'
  | '/teams/:teamId/invitations/:invitationId'
  | '/teams/:teamId/rewards/:rewardId'
  | '/teams/:teamId/users/:userId'
  | '/teams/:teamId/users/:userId/roles/:roleId'
  | '/teams/:teamId/leagues/:leagueId'
  | '/teams/:teamId/leagues/:leagueId/leaderboards/:leaderboardId'
  | '/activities/:activityId'
  | '/rewards/:rewardId'
  | '/leagues/:leagueId'
  | '/queue/:queueId'
  | '/sports/:sportId'
  | '/subscriptions/:subscriptionId'
  | '/users-invitations/:invitationId'
  | '/me'
  | '/me/feed/:feedItemId'

export type UploadResource = '/images'

export type CreateResourceParams<T> = T extends Organisation
  ? Payload<CreateOrganisationDto>
  : T extends Team
  ? Payload<CreateTeamDto>
  : T extends Activity
  ? Payload<CreateActivityDto>
  : T extends AuthLogin
  ? Payload<AuthLoginDto>
  : T extends AuthRefresh
  ? Payload<AuthRefreshDto>
  : T extends AuthLogout
  ? Payload<{}>
  : never

export type UploadResourceParams = FilePayload

export type CreatableResourceResponse<T> = T extends AuthLogin
  ? AuthResultDto
  : T extends AuthRefresh
  ? AuthResultDto
  : T extends AuthLogout
  ? { success: true }
  : never

export type UpdateResourceParams<T> = T extends Organisation
  ? Payload<UpdateOrganisationDto>
  : T extends Team
  ? Payload<UpdateTeamDto>
  : T extends Activity
  ? Payload<UpdateActivityDto>
  : never

export type ResourceParams = NodeJS.Dict<string>

export type ListParams = NodeJS.Dict<any> & {
  limit?: number
  page?: number
  query?: NodeJS.Dict<any>
}

export type ListResponse<T> = {
  total: number
  page_total: number
  results: T[]
}

export type DeleteResult = {
  affected: number
}

export type ResponseError = {
  response: {
    data: {
      status: number

      /** Error message */
      message: string

      /** Field errors if available */
      errors?: { [field: string]: string };
    }
  }
}
