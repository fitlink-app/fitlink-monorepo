import { CreateOrganisationDto } from '../../api/src/modules/organisations/dto/create-organisation.dto'
import { UpdateOrganisationDto } from '../../api/src/modules/organisations/dto/update-organisation.dto'
import { CreateTeamDto } from '../../api/src/modules/teams/dto/create-team.dto'
import { UpdateTeamDto } from '../../api/src/modules/teams/dto/update-team.dto'
import { Activity } from '../../api/src/modules/activities/entities/activity.entity'
import { CreateActivityDto } from '../../api/src/modules/activities/dto/create-activity.dto'
import { UpdateActivityDto } from '../../api/src/modules/activities/dto/update-activity.dto'
import { Organisation } from '../../api/src/modules/organisations/entities/organisation.entity'
import { Team } from '../../api/src/modules/teams/entities/team.entity'
import {
  AuthLoginDto,
  AuthRefreshDto
} from '../../api/src/modules/auth/dto/auth-login'
import {
  AuthResultDto,
  AuthLogoutDto
} from '../../api/src/modules/auth/dto/auth-result'
// import { User } from '../../api/src/modules/users/entities/user.entity'

export type { AuthResultDto, AuthLogoutDto, AuthLoginDto }

type Payload<T> = NodeJS.Dict<any> & {
  payload?: T
}

export type AuthLogin = '/auth/login'
export type AuthLogout = '/auth/logout'
export type AuthRefresh = '/auth/refresh'
export type CreatableResource = AuthLogin | AuthLogout | AuthRefresh

export type ListResource =
  | '/organisations'
  | '/organisations/:organisationId/activities'
  | '/organisations/:organisationId/teams'
  | '/teams/:teamId/activities'

export type ReadResource =
  | '/organisations/:organisationId'
  | '/organisations/:organisationId/activities/:activityId'
  | '/organisations/:organisationId/teams/:teamId'
  | '/teams/:teamId'
  | '/teams/:teamId/activities/:activityId'

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
