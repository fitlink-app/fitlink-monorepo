import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  ForbiddenException,
  HttpCode,
  BadRequestException,
  Query
} from '@nestjs/common'
import { RewardsService } from './rewards.service'
import { CreateRewardDto } from './dto/create-reward.dto'
import { UpdateRewardDto } from './dto/update-reward.dto'
import { Iam } from '../../decorators/iam.decorator'
import { User } from '../../decorators/authenticated-user.decorator'
import { Pagination } from '../../decorators/pagination.decorator'
import { Roles } from '../user-roles/user-roles.constants'
import { AuthenticatedUser } from '../../models'
import { PaginationQuery } from '../../helpers/paginate'
import { ApiResponse, ApiTags } from '@nestjs/swagger'
import {
  ApiBaseResponses,
  DeleteResponse,
  UpdateResponse
} from '../../decorators/swagger.decorator'
import {
  Reward,
  RewardPublic,
  RewardNext,
  RewardPublicPagination
} from './entities/reward.entity'
import {
  RewardFiltersDto,
  RewardGlobalFilterDto
} from './dto/reward-filters.dto'
import { Public } from '../../decorators/public.decorator'
import { RewardRedeemType } from './rewards.constants'

@ApiBaseResponses()
@Controller()
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  @ApiTags('rewards')
  @ApiResponse({ type: Reward, status: 201 })
  @Iam(Roles.OrganisationAdmin, Roles.TeamAdmin, Roles.SuperAdmin)
  @Post([
    '/organisations/:organisationId/rewards',
    '/teams/:teamId/rewards',
    '/rewards'
  ])
  create(
    @Body() createRewardDto: CreateRewardDto,
    @Param('teamId') teamId: string,
    @Param('organisationId') organisationId: string,
    @User() authUser: AuthenticatedUser
  ) {
    if (
      createRewardDto.redeem_type === RewardRedeemType.BFIT &&
      !createRewardDto.bfit_required
    ) {
      throw new BadRequestException(
        'Field bfit_required is required when redeem_type is BFIT'
      )
    }
    if (
      createRewardDto.redeem_type === RewardRedeemType.Points &&
      !createRewardDto.points_required
    ) {
      throw new BadRequestException(
        'Field points_required is required when redeem_type is Points'
      )
    }
    // For team admins and organisation admin
    if (teamId) {
      createRewardDto.teamId = teamId
    } else if (organisationId) {
      createRewardDto.organisationId = organisationId
    } else if (!authUser.isSuperAdmin()) {
      throw new ForbiddenException('You do not have access to create rewards.')
    }

    return this.rewardsService.create(createRewardDto)
  }

  @ApiTags('rewards')
  @ApiResponse({ type: RewardPublicPagination, status: 200 })
  @Get('/rewards')
  findAll(
    @User() authUser: AuthenticatedUser,
    @Pagination() pagination: PaginationQuery,
    @Query() appFilters: RewardFiltersDto,
    @Query() dashboardFilters: RewardGlobalFilterDto
  ) {
    if (authUser.isSuperAdmin()) {
      return this.rewardsService.findAll(pagination, dashboardFilters)
    }
    return this.rewardsService.findManyAccessibleToUser(
      authUser.id,
      pagination,
      appFilters
    )
  }

  @Iam(Roles.OrganisationAdmin, Roles.TeamAdmin)
  @ApiTags('rewards')
  @ApiResponse({ type: RewardPublicPagination, status: 200 })
  @Get(['/organisations/:organisationId/rewards', '/teams/:teamId/rewards'])
  findAllRewardsForOrganisationsOrTeams(
    @Param('teamId') teamId: string,
    @Param('organisationId') organisationId: string,
    @Pagination() pagination: PaginationQuery,
    @Query() dashboardFilters: RewardGlobalFilterDto
  ) {
    return this.rewardsService.findAll(pagination, dashboardFilters, {
      organisationId,
      teamId
    })
  }

  @ApiTags('me')
  @Get('/me/next-reward')
  @ApiResponse({ type: RewardNext, status: 200 })
  nextReward(@User() authUser: AuthenticatedUser) {
    return this.rewardsService.getPointsUntilNextReward(authUser.id)
  }

  @ApiTags('me')
  @Get('/me/rewards')
  @ApiResponse({ type: RewardPublicPagination, status: 200 })
  findMyRewards(
    @User() authUser: AuthenticatedUser,
    @Pagination() pagination: PaginationQuery
  ) {
    return this.rewardsService.findRedeemedRewards(authUser.id, pagination)
  }

  @ApiTags('rewards')
  @Get('/rewards/:rewardId')
  @ApiResponse({ type: RewardPublic, status: 200 })
  async findOne(
    @Param('rewardId') rewardId: string,
    @User() authUser: AuthenticatedUser
  ) {
    if (!authUser.isSuperAdmin()) {
      const result = await this.rewardsService.findOneAccessibleToUser(
        rewardId,
        authUser.id
      )
      if (!result) {
        throw new ForbiddenException(
          'You do not have permission to view this reward'
        )
      }
      return result
    } else {
      return this.rewardsService.findOne(rewardId)
    }
  }

  @Iam(Roles.OrganisationAdmin, Roles.TeamAdmin, Roles.SuperAdmin)
  @Put([
    '/rewards/:rewardId',
    '/teams/:teamId/rewards/:rewardId',
    '/organisations/:organisationId/rewards/:rewardId'
  ])
  @UpdateResponse()
  async update(
    @Param('rewardId') rewardId: string,
    @Param('teamId') teamId: string,
    @Param('organisationId') organisationId: string,
    @User() authUser: AuthenticatedUser,
    @Body() body: UpdateRewardDto
  ) {
    // Superadmin can edit any reward
    if (authUser.isSuperAdmin()) {
      return this.rewardsService.update(rewardId, body)
    }

    // Team and organisation admins can edit the reward
    // but RewardAccess enum is forced in the method to the appropriate type
    const result = await this.rewardsService.update(rewardId, body, {
      teamId,
      organisationId
    })

    if (!result) {
      throw new ForbiddenException(
        'You do not have permission to edit this reward'
      )
    }

    return result
  }

  @DeleteResponse()
  @Iam(Roles.OrganisationAdmin, Roles.TeamAdmin, Roles.SuperAdmin)
  @Delete([
    '/rewards/:rewardId',
    '/teams/:teamId/rewards/:rewardId',
    '/organisations/:organisationId/rewards/:rewardId'
  ])
  async delete(
    @Param('rewardId') rewardId: string,
    @Param('teamId') teamId: string,
    @Param('organisationId') organisationId: string,
    @User() authUser: AuthenticatedUser
  ) {
    // Superadmin can edit any reward
    if (authUser.isSuperAdmin()) {
      return this.rewardsService.remove(rewardId)
    }

    // Team and organisation admins can edit the reward, with their permission
    // enforced using Iam decorator.
    const result = await this.rewardsService.remove(rewardId, {
      teamId,
      organisationId
    })

    if (!result) {
      throw new ForbiddenException(
        'You do not have permission to delete this reward'
      )
    }

    return result
  }

  @ApiTags('rewards')
  @Post('/rewards/:rewardId/redeem')
  @HttpCode(200)
  @ApiResponse({ type: RewardPublic, status: 200 })
  async redeem(
    @Param('rewardId') rewardId: string,
    @User() authUser: AuthenticatedUser
  ) {
    const reward = await this.rewardsService.findOneAccessibleToUser(
      rewardId,
      authUser.id,
      {
        checkExpiry: false,
        checkAvailability: false
      }
    )

    if (!reward) {
      throw new ForbiddenException(
        'You do not have permission to redeem this reward'
      )
    }

    const result = await this.rewardsService.redeem(reward, authUser.id)

    // Reward has expired
    if (result === 'reward expired') {
      throw new BadRequestException('The reward has already expired')
    }

    // Reward redemptions are finished (limited supply)
    if (result === 'not available') {
      throw new BadRequestException('The reward is no longer available')
    }

    // Reward was already redeemed
    if (result === 'already redeemed') {
      throw new BadRequestException('You have already redeemed this reward')
    }

    // If the reward could not be redeemed, it's due to lack of points
    if (result === 'insufficient points') {
      throw new BadRequestException(
        'You have insufficient points to redeem this reward'
      )
    }

    if (result === 'insufficient bfit') {
      throw new BadRequestException(
        'You have insufficient bfit to redeem this reward'
      )
    }

    // return updated reward
    return await this.rewardsService.findOneAccessibleToUser(
      rewardId,
      authUser.id
    )
  }

  @Public()
  @Get('/teams/:teamId/public/rewards')
  async getTeamRewardsForPublicPage(@Param('teamId') teamId: string) {
    const rewards = await this.rewardsService.getTeamRewardsForPublicPage(
      teamId
    )
    return rewards
  }
}
