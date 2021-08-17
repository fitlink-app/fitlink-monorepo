import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query
} from '@nestjs/common'
import { Iam } from '../../decorators/iam.decorator'
import { ApiBaseResponses } from '../../decorators/swagger.decorator'
import { Roles } from '../user-roles/user-roles.constants'
import { DateQueryDto } from './dto/date-query.dto'
import { GoalQueryDto } from './dto/goal-query.dto'
import { StatsService } from './services/stats.service'

@ApiBaseResponses()
@Controller()
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Iam(Roles.SuperAdmin)
  @Get('/stats/health-activities')
  findAppHealthActivities(@Query() { start_at, end_at }: DateQueryDto) {
    return this.statsService.queryPopularActivities('NONE', 'app', {
      start_at,
      end_at
    })
  }

  @Iam(Roles.SuperAdmin)
  @Get('/stats/goals')
  findAppGoals(@Query() { start_at, end_at }: GoalQueryDto) {
    return this.statsService.queryDailyGoals('NONE', 'app', {
      start_at,
      end_at
    })
  }

  @Iam(Roles.SuperAdmin)
  @Get('/stats/rewards')
  findAppRewards(@Query() { start_at, end_at }: DateQueryDto) {
    return this.statsService.queryPopularRewards('NONE', 'app', {
      start_at,
      end_at
    })
  }

  @Iam(Roles.SuperAdmin)
  @Get('/stats/global')
  findAppGlobalStats() {
    return this.statsService.queryGlobalStats('NONE', 'app')
  }

  @Iam(Roles.OrganisationAdmin)
  @Get('/organisations/:organisationId/stats/rewards')
  findAppRewardsInOrganisation(
    @Param('organisationId') organisationId: string,
    @Query() { start_at, end_at }: GoalQueryDto
  ) {
    return this.statsService.queryPopularRewards(
      organisationId,
      'organisation',
      {
        start_at,
        end_at
      }
    )
  }

  @Iam(Roles.OrganisationAdmin)
  @Get('/organisations/:organisationId/stats/global')
  findGlobalStatsInOrganisation(
    @Param('organisationId') organisationId: string
  ) {
    return this.statsService.queryGlobalStats(organisationId, 'organisation')
  }

  @Iam(Roles.TeamAdmin)
  @Get('/teams/:teamId/stats/rewards')
  findAppRewardsInTeam(
    @Param('teamId') teamId: string,
    @Query() { start_at, end_at }: GoalQueryDto
  ) {
    return this.statsService.queryPopularRewards(teamId, 'team', {
      start_at,
      end_at
    })
  }

  @Iam(Roles.TeamAdmin)
  @Get('/teams/:teamId/stats/global')
  findGlobalStatsInTeam(@Param('teamId') teamId: string) {
    return this.statsService.queryGlobalStats(teamId, 'team')
  }

  @Iam(Roles.SuperAdmin)
  @Get('/stats/leagues')
  findAppLeagues(@Query() { start_at, end_at }: DateQueryDto) {
    return this.statsService.queryPopularLeagues('NONE', 'app', {
      start_at,
      end_at
    })
  }

  @Iam(Roles.OrganisationAdmin)
  @Get('/organisations/:organisationId/stats/leagues')
  findAppLeaguesInOrganisation(
    @Param('organisationId') organisationId: string,
    @Query() { start_at, end_at }: GoalQueryDto
  ) {
    return this.statsService.queryPopularLeagues(
      organisationId,
      'organisation',
      {
        start_at,
        end_at
      }
    )
  }

  @Iam(Roles.TeamAdmin)
  @Get('/teams/:teamId/stats/leagues')
  findAppLeaguesInTeam(
    @Param('teamId') teamId: string,
    @Query() { start_at, end_at }: GoalQueryDto
  ) {
    return this.statsService.queryPopularLeagues(teamId, 'team', {
      start_at,
      end_at
    })
  }

  @Iam(Roles.OrganisationAdmin)
  @Get('/organisations/:organisationId/stats/goals')
  findAppGoalsInOrganisation(
    @Param('organisationId') organisationId: string,
    @Query() { start_at, end_at }: GoalQueryDto
  ) {
    return this.statsService.queryDailyGoals(organisationId, 'organisation', {
      start_at,
      end_at
    })
  }

  @Iam(Roles.TeamAdmin)
  @Get('/teams/:teamId/stats/goals')
  findAppGoalsInTeam(
    @Param('teamId') teamId: string,
    @Query() { start_at, end_at }: GoalQueryDto
  ) {
    return this.statsService.queryDailyGoals(teamId, 'team', {
      start_at,
      end_at
    })
  }

  @Iam(Roles.OrganisationAdmin)
  @Get('/organisations/:organisationId/stats/health-activities')
  findOrganisationHealthActivities(
    @Param('organisationId') organisationId: string,
    @Query() { start_at, end_at }: DateQueryDto
  ) {
    return this.statsService.queryPopularActivities(
      organisationId,
      'organisation',
      {
        start_at,
        end_at
      }
    )
  }

  @Iam(Roles.TeamAdmin)
  @Get('/teams/:teamId/stats/health-activities')
  findTeamHealthActivities(
    @Param('teamId') teamId: string,
    @Query() { start_at, end_at }: DateQueryDto
  ) {
    return this.statsService.queryPopularActivities(teamId, 'team', {
      start_at,
      end_at
    })
  }
}
