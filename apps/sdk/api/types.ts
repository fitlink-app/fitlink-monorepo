import { CreateActivityDto } from 'apps/api/src/modules/activities/dto/create-activity.dto'
import { CreateOrganisationDto } from 'apps/api/src/modules/organisations/dto/create-organisation.dto'
import { CreateTeamDto } from 'apps/api/src/modules/teams/dto/create-team.dto'
import { Activity } from '../../api/src/modules/activities/entities/activity.entity'
import { Organisation } from '../../api/src/modules/organisations/entities/organisation.entity'
import { Team } from '../../api/src/modules/teams/entities/team.entity'

type Params = {
  limit?: number
  offset?: number
  params?: NodeJS.Dict<string>
}

type ListOrganisations = '/organisations'
type ListActivities = '/organisations/:organisationId/activities'
type ListTeams = '/organisations/:organisationId/teams'
type ListUsers = '/users'
type SingleOrganisation = '/organisations/:organisationId'
type SingleOrganisationActivity = '/organisations/:organisationId/activities/:activityId'
type SingleOrganisationTeam = '/organisations/:organisationId/teams/:teamId'

type ListOrganisationsParams = Params
type ListActivitiesParams = Params & {
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

export type SingleResource =
  | SingleOrganisation
  | SingleOrganisationActivity
  | SingleOrganisationTeam

export type CreateResource = CreateOrganisationDto | CreateActivityDto

type ListResponse = {
  pageTotal: number
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
  : never

export type CreateResourceParams<T> = T extends ListOrganisations
  ? CreateOrganisationDto
  : T extends ListActivities
  ? CreateActivityDto
  : T extends ListTeams
  ? CreateTeamDto
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
  : never

export type ApiCreateResponse<T> = T extends ListActivities
  ? Activity
  : T extends ListOrganisations
  ? Organisation
  : T extends ListTeams
  ? Team
  : never

export type ListParams = {
  limit?: number
  offset?: number
  params?: NodeJS.Dict<string>
}
