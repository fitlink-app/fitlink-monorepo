import { CreateOrganisationDto } from '@fitlink/api/src/modules/organisations/dto/create-organisation.dto'
import { UpdateOrganisationDto } from '@fitlink/api/src/modules/organisations/dto/update-organisation.dto'
import { CreateTeamDto } from '@fitlink/api/src/modules/teams/dto/create-team.dto'
import { UpdateTeamDto } from '@fitlink/api/src/modules/teams/dto/update-team.dto'
import { Activity } from '@fitlink/api/src/modules/activities/entities/activity.entity'
import { CreateActivityDto } from '@fitlink/api/src/modules/activities/dto/create-activity.dto'
import { UpdateActivityDto } from '@fitlink/api/src/modules/activities/dto/update-activity.dto'
import { Organisation } from '@fitlink/api/src/modules/organisations/entities/organisation.entity'
import {
  Subscription,
  SubscriptionUser
} from '@fitlink/api/src/modules/subscriptions/entities/subscription.entity'
import { Team } from '@fitlink/api/src/modules/teams/entities/team.entity'
import {
  AuthLoginDto,
  AuthConnectDto,
  AuthRefreshDto
} from '@fitlink/api/src/modules/auth/dto/auth-login'
import { AuthSwitchDto } from '@fitlink/api/src/modules/auth/dto/auth-switch'
import { CreateUserDto } from '@fitlink/api/src/modules/users/dto/create-user.dto'
import {
  AuthResultDto,
  AuthLogoutDto,
  AuthSignupDto
} from '@fitlink/api/src/modules/auth/dto/auth-result'
import { User } from '@fitlink/api/src/modules/users/entities/user.entity'
import {
  UpdateUserAvatarDto,
  UpdateUserDto,
  UpdateUserEmailDto,
  UpdateUserPasswordDto
} from '@fitlink/api/src/modules/users/dto/update-user.dto'
import { CreateDefaultSubscriptionDto } from '@fitlink/api/src/modules/subscriptions/dto/create-default-subscription.dto'
import { UpdateSubscriptionDto } from '@fitlink/api/src/modules/subscriptions/dto/update-subscription.dto'
import { AddUserToSubscriptionDto } from '@fitlink/api/src/modules/subscriptions/dto/add-user-to-subscription.dto'
import { AuthRequestResetPasswordDto } from '@fitlink/api/src/modules/auth/dto/auth-reset-password'

export type {
  AuthResultDto,
  AuthLogoutDto,
  AuthLoginDto,
  AuthSwitchDto,
  AuthSignupDto,
  AuthConnectDto,
  AuthRequestResetPasswordDto,
  CreateUserDto,
  UpdateUserDto,
  UpdateUserEmailDto,
  UpdateUserPasswordDto,
  UpdateUserAvatarDto
}

export enum AuthProviderType {
  Google = 'google.com',
  Apple = 'apple.com'
}

type Payload<T> = NodeJS.Dict<any> & {
  payload?: T
}

type FilePayload = NodeJS.Dict<any> & {
  payload: FormData
}

export type AuthLogin = '/auth/login'
export type AuthLogout = '/auth/logout'
export type AuthRefresh = '/auth/refresh'
export type AuthSignUp = '/auth/signup'
export type AuthConnect = '/auth/connect'
export type AuthSwitch = '/auth/switch'
export type AuthRequestResetPassword = '/auth/request-password-reset'

export type CreatableResource =
  | AuthLogin
  | AuthLogout
  | AuthRefresh
  | AuthSignUp
  | AuthConnect
  | AuthSwitch
  | AuthRequestResetPassword

export type ListResource =
  | '/organisations'
  | '/organisations/:organisationId/activities'
  | '/organisations/:organisationId/users'
  | '/organisations/:organisationId/teams'
  | '/organisations/:organisationId/subscriptions'
  | '/organisations/:organisationId/invitations'
  | '/organisations/:organisationId/rewards'
  | '/organisations/:organisationId/leagues'
  | '/organisations/:organisationId/leagues/:leagueId/leaderboards'
  | '/organisations/:organisationId/stats'
  | '/organisations/:organisationId/stats/health-activities'
  | '/teams/:teamId/activities'
  | '/teams/:teamId/invitations'
  | '/teams/:teamId/rewards'
  | '/teams/:teamId/rewards/:rewardId/redemptions'
  | '/teams/:teamId/users'
  | '/teams/:teamId/stats'
  | '/teams/:teamId/stats/health-activities'
  | '/teams/:teamId/users/:userId/roles'
  | '/teams/:teamId/leagues'
  | '/teams/:teamId/leagues/:leagueId/leaderboards'
  | '/users'
  | '/users/search'
  | '/activities'
  | '/rewards'
  | '/rewards/:rewardId/redemptions'
  | '/queue'
  | '/sports'
  | '/subscriptions'
  | '/subscriptions/:subscriptionId/users'
  | '/subscriptions/:subscriptionId/chargebee/payment-sources'
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
  | '/stats/health-activities'

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
  | '/subscriptions/:subscriptionId/users/:userId'
  | '/subscriptions/:subscriptionId/chargebee/hosted-page'
  | '/users/:userId'
  | '/users-invitations/:invitationId'
  | '/me'
  | '/me/roles'
  | '/me/next-reward'
  | '/me/feed/:feedItemId'
  | '/me/avatar'
  | '/me/email'
  | '/me/password'
  | '/stats/goals'
  | '/stats/rewards'
  | '/stats/leagues'
  | '/stats/global'
  | '/organisations/:organisationId/stats/goals'
  | '/organisations/:organisationId/stats/rewards'
  | '/organisations/:organisationId/stats/leagues'
  | '/organisations/:organisationId/stats/global'
  | '/teams/:teamId/stats/goals'
  | '/teams/:teamId/stats/rewards'
  | '/teams/:teamId/stats/leagues'
  | '/teams/:teamId/stats/global'

export type UploadResource = '/images'

export type CreateUserResult = {
  auth: AuthResultDto
  me: User
}

export type CreateResourceParams<T> = T extends Organisation
  ? Payload<CreateOrganisationDto>
  : T extends Subscription
  ? Payload<CreateDefaultSubscriptionDto>
  : T extends SubscriptionUser
  ? Payload<AddUserToSubscriptionDto>
  : T extends Team
  ? Payload<CreateTeamDto>
  : T extends Activity
  ? Payload<CreateActivityDto>
  : T extends AuthSignUp
  ? Payload<CreateUserDto>
  : T extends AuthLogin
  ? Payload<AuthLoginDto>
  : T extends AuthConnect
  ? Payload<AuthConnectDto>
  : T extends AuthRefresh
  ? Payload<AuthRefreshDto>
  : T extends AuthSwitch
  ? Payload<AuthSwitchDto>
  : T extends AuthLogout
  ? Payload<{}>
  : T extends AuthRequestResetPassword
  ? Payload<AuthRequestResetPasswordDto>
  : never

export type UploadResourceParams = FilePayload

export type CreatableResourceResponse<T> = T extends AuthSignUp
  ? CreateUserResult
  : T extends AuthLogin
  ? AuthResultDto
  : T extends AuthRefresh
  ? AuthResultDto
  : T extends AuthConnect
  ? AuthSignupDto
  : T extends AuthSwitch
  ? AuthResultDto
  : T extends AuthLogout
  ? { success: true }
  : T extends SubscriptionUser
  ? { success: boolean }
  : never

export type UpdateResourceParams<T> = T extends Organisation
  ? Payload<UpdateOrganisationDto>
  : T extends Subscription
  ? Payload<UpdateSubscriptionDto>
  : T extends Team
  ? Payload<UpdateTeamDto>
  : T extends Activity
  ? Payload<UpdateActivityDto>
  : T extends User
  ? Payload<UpdateUserDto>
  : T extends ImageUpload
  ? Payload<ImageUpload | UpdateUserAvatarDto>
  : T extends UpdateUserPasswordDto
  ? Payload<UpdateUserPasswordDto>
  : T extends UpdateUserEmailDto
  ? Payload<UpdateUserEmailDto>
  : never

export type ResourceParams = NodeJS.Dict<any> & {
  query?: NodeJS.Dict<string>
}

export type ImageUpload = {
  imageId: string
}

export type Password = {}
export type Email = {}

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

export type UpdateResult = {
  affected: number
}

export type BooleanResult = {
  success: boolean
}

export type ResponseError = {
  response: {
    data: {
      status: number

      /** Error message */
      message: string

      /** Field errors if available */
      errors?: { [field: string]: string }
    }
  }
}
