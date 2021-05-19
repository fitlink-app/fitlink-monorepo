import { CreateActivityDto } from 'apps/api/src/modules/activities/dto/create-activity.dto'
import { CreateOrganisationDto } from 'apps/api/src/modules/organisations/dto/create-organisation.dto'
import { CreateTeamDto } from 'apps/api/src/modules/teams/dto/create-team.dto'
import { Activity } from '../../api/src/modules/activities/entities/activity.entity'
import { Organisation } from '../../api/src/modules/organisations/entities/organisation.entity'
import { Team } from '../../api/src/modules/teams/entities/team.entity'
import { AuthLoginDto } from '../../api/src/modules/auth/dto/auth-login'
import { AuthResultDto } from '../../api/src/modules/auth/dto/auth-result'
import { User } from '../../api/src/modules/users/entities/user.entity'

export type ListParams = {
  limit?: number
  page?: number
  params?: NodeJS.Dict<any>
}

type ListOrganisations = '/organisations'
type ListActivities = '/organisations/:organisationId/activities'
type ListTeams = '/organisations/:organisationId/teams'
type ListUsers = '/users'
type SingleOrganisation = '/organisations/:organisationId'
type SingleOrganisationActivity = '/organisations/:organisationId/activities/:activityId'
type SingleOrganisationTeam = '/organisations/:organisationId/teams/:teamId'
type AuthLogin = '/auth/login'
type AuthLogout = '/auth/logout'

type Me = '/me'
type MyLeagues = '/me/leagues'

type ListOrganisationsParams = ListParams
type ListActivitiesParams = ListParams & {
  params: {
    organisationId: string
  }
}

type SingleOrganisationParams = { organisationId: string }
type SingleOrganisationTeamParams = SingleOrganisationParams & {
  teamId: string
}
type SingleOrganisationActivityParams = SingleOrganisationParams & {
  activityId: string
}

export type ListResource = ListOrganisations | ListActivities | ListUsers
export type AuthResource = AuthLogin | AuthLogout

export type SingleResource =
  | SingleOrganisation
  | SingleOrganisationActivity
  | SingleOrganisationTeam
  | Me

export type CreateResource = CreateOrganisationDto | CreateActivityDto

type ListResponse = {
  page_total: number
  total: number
}

type ListResponseOrganisations = ListResponse & {
  results: Organisation[]
}

type ListResponseActivities = ListResponse & {
  results: Activity[]
}

export type ListResourceParams<T> = T extends ListActivities
  ? ListActivitiesParams
  : T extends ListOrganisations
  ? ListOrganisationsParams
  : never

export type SingleResourceParams<T> = T extends SingleOrganisation
  ? SingleOrganisationParams
  : T extends SingleOrganisationActivity
  ? SingleOrganisationActivityParams
  : T extends SingleOrganisationTeam
  ? SingleOrganisationTeamParams
  : T extends Me
  ? never
  : never

export type CreateResourceParams<T> = T extends ListOrganisations
  ? CreateOrganisationDto
  : T extends ListActivities
  ? CreateActivityDto
  : T extends ListTeams
  ? CreateTeamDto
  : T extends AuthLogin
  ? AuthLoginDto
  : never

export type UpdateResourceParams<T> = T extends SingleOrganisation
  ? SingleOrganisationParams
  : never

export type ApiResponse<T> = T extends ListActivities
  ? ListResponseActivities
  : T extends ListOrganisations
  ? ListResponseOrganisations
  : T extends SingleOrganisation
  ? Organisation
  : T extends SingleOrganisationActivity
  ? Activity
  : T extends SingleOrganisationTeam
  ? Team
  : T extends Me
  ? User
  : never

export type ApiCreateResponse<T> = T extends ListActivities
  ? Activity
  : T extends ListOrganisations
  ? Organisation
  : T extends ListTeams
  ? Team
  : T extends AuthLogin
  ? AuthResultDto
  : never

export type ApiUpdateResponse<T> = T extends SingleOrganisation
  ? Partial<Organisation>
  : never
