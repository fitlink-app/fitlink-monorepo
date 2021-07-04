import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  ForbiddenException,
  Query
} from '@nestjs/common'
import { RewardsService } from './rewards.service'
import { CreateRewardDto } from './dto/create-reward.dto'
import { UpdateRewardDto } from './dto/update-reward.dto'
import { Iam } from '../../decorators/iam.decorator'
import { User } from '../../decorators/authenticated-user.decorator'
import { Pagination } from '../../decorators/pagination.decorator'
import { Roles } from '../user-roles/entities/user-role.entity'
import { AuthenticatedUser } from '../../models'
import { PaginationQuery } from '../../helpers/paginate'
import { ApiTags } from '@nestjs/swagger'

@Controller()
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  @ApiTags('rewards')
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
  @Get('/rewards')
  findAll(
    @User() authUser: AuthenticatedUser,
    @Pagination() pagination: PaginationQuery
  ) {
    if (authUser.isSuperAdmin()) {
      return this.rewardsService.findAll(pagination)
    }

    return this.rewardsService.findManyAccessibleToUser(authUser.id, pagination)
  }

  @ApiTags('rewards')
  @Get('/rewards/:rewardId')
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
}
