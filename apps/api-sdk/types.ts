import { CreateOrganisationDto } from '@fitlink/api/src/modules/organisations/dto/create-organisation.dto'
import { UpdateOrganisationDto } from '@fitlink/api/src/modules/organisations/dto/update-organisation.dto'
import { CreateTeamDto } from '@fitlink/api/src/modules/teams/dto/create-team.dto'
import { UpdateTeamDto } from '@fitlink/api/src/modules/teams/dto/update-team.dto'
import { Activity } from '@fitlink/api/src/modules/activities/entities/activity.entity'
import { CreateActivityDto } from '@fitlink/api/src/modules/activities/dto/create-activity.dto'
import { UpdateActivityDto } from '@fitlink/api/src/modules/activities/dto/update-activity.dto'
import { League } from '@fitlink/api/src/modules/leagues/entities/league.entity'
import { CreateLeagueDto } from '@fitlink/api/src/modules/leagues/dto/create-league.dto'
import { UpdateLeagueDto } from '@fitlink/api/src/modules/leagues/dto/update-league.dto'
import { Reward } from '@fitlink/api/src/modules/rewards/entities/reward.entity'
import { CreateRewardDto } from '@fitlink/api/src/modules/rewards/dto/create-reward.dto'
import { UpdateRewardDto } from '@fitlink/api/src/modules/rewards/dto/update-reward.dto'
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
  CreateOrganisationAsUserDto,
  CreateUserWithOrganisationDto
} from '@fitlink/api/src/modules/users/dto/create-user-with-organisation.dto'
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
  UpdateUserPasswordDto,
  VerifyUserEmailDto
} from '@fitlink/api/src/modules/users/dto/update-user.dto'
import { CreateDefaultSubscriptionDto } from '@fitlink/api/src/modules/subscriptions/dto/create-default-subscription.dto'
import { UpdateSubscriptionDto } from '@fitlink/api/src/modules/subscriptions/dto/update-subscription.dto'
import { AddUserToSubscriptionDto } from '@fitlink/api/src/modules/subscriptions/dto/add-user-to-subscription.dto'
import {
  AuthRequestResetPasswordDto,
  AuthResetPasswordDto
} from '@fitlink/api/src/modules/auth/dto/auth-reset-password'
import { CreateAdminDto } from '@fitlink/api/src/modules/users/dto/create-admin.dto'
import { CreateFcmTokenDto } from '@fitlink/api/src/modules/users/dto/create-fcm-token.dto'
import { UserRole } from '@fitlink/api/src/modules/user-roles/entities/user-role.entity'
import { TeamsInvitation } from '@fitlink/api/src/modules/teams-invitations/entities/teams-invitation.entity'
import { RespondTeamsInvitationDto } from '@fitlink/api/src/modules/teams-invitations/dto/respond-teams-invitation.dto'
import { RespondOrganisationsInvitationDto } from '@fitlink/api/src/modules/organisations-invitations/dto/respond-organisations-invitation.dto'
import { RespondSubscriptionsInvitationDto } from '@fitlink/api/src/modules/subscriptions/dto/respond-subscriptions-invitation.dto'
import { UpdateUsersSettingDto } from '@fitlink/api/src/modules/users-settings/dto/update-users-setting.dto'
import { CreatePageDto } from '@fitlink/api/src/modules/pages/dto/create-page.dto'
import { SendNotificationDto } from '@fitlink/api/src/modules/notifications/dto/send-notification.dto'

export type {
  AuthResultDto,
  AuthLogoutDto,
  AuthLoginDto,
  AuthSwitchDto,
  AuthSignupDto,
  AuthConnectDto,
  AuthRequestResetPasswordDto,
  CreateUserDto,
  CreateUserWithOrganisationDto,
  CreateOrganisationAsUserDto,
  UpdateUserDto,
  UpdateUserEmailDto,
  UpdateUserPasswordDto,
  UpdateUserAvatarDto,
  CreateFcmTokenDto
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
export type AuthSignUpOrganisation = '/auth/organisation'
export type AuthNewOrganisation = '/auth/new-organisation'
export type AuthRequestResetPassword = '/auth/request-password-reset'
export type AuthResetPassword = '/auth/reset-password'
export type TeamsInvitationsVerify = '/teams-invitations/verify'
export type TeamsInvitationsRespond = '/teams-invitations/respond'
export type OrganisationsInvitationsVerify = '/organisations-invitations/verify'
export type OrganisationsInvitationsRespond = '/organisations-invitations/respond'
export type SubscriptionsInvitationsVerify = '/subscriptions-invitations/verify'
export type SubscriptionsInvitationsRespond = '/subscriptions-invitations/respond'
export type CreateStravaSubscription = '/providers/strava/webhook/register'
export type VerifyUserEmail = '/users/verify-email'
export type RegenerateJoinCode = '/teams/:teamId/regenerate-join-code'
export type CreatePage = '/teams/:teamId/page'
export type SendMessage = '/teams/:teamId/users/:userId/notifications'
export type CreateFcmToken = '/me/fcm-token'

export type CreatableResource =
  | AuthLogin
  | AuthLogout
  | AuthRefresh
  | AuthConnect
  | AuthSwitch
  | AuthSignUp
  | AuthSignUpOrganisation
  | AuthNewOrganisation
  | AuthRequestResetPassword
  | AuthResetPassword
  | TeamsInvitationsVerify
  | TeamsInvitationsRespond
  | OrganisationsInvitationsVerify
  | OrganisationsInvitationsRespond
  | SubscriptionsInvitationsVerify
  | SubscriptionsInvitationsRespond
  | CreateStravaSubscription
  | VerifyUserEmail
  | RegenerateJoinCode
  | CreatePage
  | SendMessage
  | CreateFcmToken

export type ListResource =
  | '/organisations'
  | '/organisations/:organisationId/activities'
  | '/organisations/:organisationId/users'
  | '/organisations/:organisationId/admins'
  | '/organisations/:organisationId/teams'
  | '/organisations/:organisationId/teams/:teamId/admins'
  | '/organisations/:organisationId/teams/:teamId/invitations'
  | '/organisations/:organisationId/subscriptions'
  | '/organisations/:organisationId/subscriptions/:subscriptionId/admins'
  | '/organisations/:organisationId/subscriptions/:subscriptionId/invitations'
  | '/organisations/:organisationId/invitations'
  | '/organisations/:organisationId/rewards'
  | '/organisations/:organisationId/leagues'
  | '/organisations/:organisationId/leagues/:leagueId/leaderboards'
  | '/organisations/:organisationId/stats'
  | '/organisations/:organisationId/stats/health-activities'
  | '/teams'
  | '/teams/:teamId/activities'
  | '/teams/:teamId/invitations'
  | '/teams/:teamId/rewards'
  | '/teams/:teamId/rewards/:rewardId/redemptions'
  | '/teams/:teamId/users'
  | '/teams/:teamId/admins'
  | '/teams/:teamId/stats'
  | '/teams/:teamId/stats/health-activities'
  | '/teams/:teamId/users/:userId/roles'
  | '/teams/:teamId/leagues'
  | '/teams/:teamId/leagues/:leagueId/leaderboards'
  | '/admins'
  | '/users'
  | '/users/search'
  | '/activities'
  | '/activities/global'
  | '/rewards'
  | '/rewards/:rewardId/redemptions'
  | '/queue'
  | '/sports'
  | '/subscriptions'
  | '/subscriptions/:subscriptionId/admins'
  | '/subscriptions/:subscriptionId/users'
  | '/subscriptions/:subscriptionId/chargebee/payment-sources'
  | '/subscriptions/:subscriptionId/chargebee/invoices'
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
  | '/stats'
  | '/health-activities-debug'

export type ReadResource =
  | '/organisations/:organisationId'
  | '/organisations/:organisationId/activities/:activityId'
  | '/organisations/:organisationId/admins/:userId'
  | '/organisations/:organisationId/teams/:teamId'
  | '/organisations/:organisationId/teams/:teamId/admins/:userId'
  | '/organisations/:organisationId/subscriptions/:subscriptionId'
  | '/organisations/:organisationId/subscriptions/:subscriptionId/admins/:userId'
  | '/organisations/:organisationId/invitations/:invitationId'
  | '/organisations/:organisationId/leagues/:leagueId'
  | '/teams/:teamId'
  | '/teams/:teamId/activities/:activityId'
  | '/teams/:teamId/invitations/:invitationId'
  | '/teams/:teamId/rewards/:rewardId'
  | '/teams/:teamId/users/:userId'
  | '/teams/:teamId/admins/:userId'
  | '/teams/:teamId/users/:userId/roles/:roleId'
  | '/teams/:teamId/leagues/:leagueId'
  | '/teams/:teamId/leagues/:leagueId/leaderboards/:leaderboardId'
  | '/teams/:teamId/invite-link'
  | '/teams/code/:code'
  | '/activities/:activityId'
  | '/rewards/:rewardId'
  | '/leagues/:leagueId'
  | '/queue/:queueId'
  | '/sports/:sportId'
  | '/subscriptions/:subscriptionId'
  | '/subscriptions/:subscriptionId/admins/:userId'
  | '/subscriptions/:subscriptionId/users/:userId'
  | '/subscriptions/:subscriptionId/chargebee/hosted-page'
  | '/subscriptions/:subscriptionId/chargebee/subscription'
  | '/subscriptions/:subscriptionId/chargebee/invoice-download-link/:invoiceId'
  | '/admins/:userId'
  | '/users/:userId'
  | '/users-invitations/:invitationId'
  | '/me'
  | '/me/roles'
  | '/me/role'
  | '/me/ping'
  | '/me/next-reward'
  | '/me/feed/:feedItemId'
  | '/me/avatar'
  | '/me/email'
  | '/me/password'
  | '/me/settings'
  | '/me/providers'
  | '/me/fcm-token'
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
  | '/teams/:teamId/page'
  | '/providers/strava'
  | '/providers/strava/webhook/view'
  | '/providers/strava/auth'
  | '/providers/strava/webhook/register/:id'
  | '/providers/fitbit'
  | '/providers/fitbit/auth'
  | '/app/config'
  | '/auth/reset-password'

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
  : T extends Reward
  ? Payload<CreateRewardDto>
  : T extends League
  ? Payload<CreateLeagueDto>
  : T extends AuthSignUp
  ? Payload<CreateUserDto>
  : T extends AuthSignUpOrganisation
  ? Payload<CreateUserWithOrganisationDto>
  : T extends AuthNewOrganisation
  ? Payload<CreateOrganisationAsUserDto>
  : T extends UserRole
  ? Payload<CreateAdminDto>
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
  : T extends TeamsInvitationsVerify
  ? Payload<{ token: string }>
  : T extends TeamsInvitationsRespond
  ? Payload<RespondTeamsInvitationDto>
  : T extends OrganisationsInvitationsVerify
  ? Payload<{ token: string }>
  : T extends OrganisationsInvitationsRespond
  ? Payload<RespondOrganisationsInvitationDto>
  : T extends SubscriptionsInvitationsVerify
  ? Payload<{ token: string }>
  : T extends SubscriptionsInvitationsRespond
  ? Payload<RespondSubscriptionsInvitationDto>
  : T extends VerifyUserEmail
  ? Payload<VerifyUserEmailDto>
  : T extends RegenerateJoinCode
  ? Payload<{}>
  : never

// Typescript bug? Means we need to split this into a second type
export type CreateResourceParamsExtra<T> = T extends SendMessage
  ? Payload<SendNotificationDto>
  : T extends CreateFcmToken
  ? Payload<CreateFcmTokenDto>
  : T extends CreatePage
  ? Payload<CreatePageDto>
  : never

export type UploadResourceParams = FilePayload

export type CreatableResourceResponse<T> = T extends AuthSignUp
  ? CreateUserResult
  : T extends AuthSignUpOrganisation
  ? CreateUserResult
  : T extends AuthNewOrganisation
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
  ? { success: boolean }
  : T extends SubscriptionUser
  ? { success: boolean }
  : T extends TeamsInvitationsVerify
  ? TeamsInvitation
  : T extends TeamsInvitationsRespond
  ? TeamsInvitation
  : T extends VerifyUserEmail
  ? { success: boolean }
  : T extends RegenerateJoinCode
  ? { code: string }
  : T extends SendMessage
  ? BooleanResult
  : T extends CreateFcmToken
  ? UpdateResult
  : never

export type UpdateResourceParams<T> = T extends Organisation
  ? Payload<UpdateOrganisationDto>
  : T extends Subscription
  ? Payload<UpdateSubscriptionDto>
  : T extends Team
  ? Payload<UpdateTeamDto>
  : T extends Activity
  ? Payload<UpdateActivityDto>
  : T extends Reward
  ? Payload<UpdateRewardDto>
  : T extends League
  ? Payload<CreateLeagueDto>
  : T extends User
  ? Payload<UpdateUserDto>
  : T extends ImageUpload
  ? Payload<ImageUpload | UpdateUserAvatarDto>
  : T extends UpdateUserPasswordDto
  ? Payload<UpdateUserPasswordDto>
  : T extends UpdateUserEmailDto
  ? Payload<UpdateUserEmailDto>
  : T extends UpdateUsersSettingDto
  ? Payload<UpdateUsersSettingDto>
  : T extends AuthResetPassword
  ? Payload<AuthResetPasswordDto>
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

export type RolePrimary = {
  subscription?: string
  organisation?: string
  team?: string
  superAdmin?: boolean
}

export type FocusRole =
  | 'app'
  | 'organisation'
  | 'team'
  | 'subscription'
  | 'user'
