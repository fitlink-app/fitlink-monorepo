import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Brackets, Repository } from 'typeorm'
import { Pagination, PaginationOptionsInterface } from '../../helpers/paginate'
import { Image } from '../images/entities/image.entity'
import { Organisation } from '../organisations/entities/organisation.entity'
import { Team } from '../teams/entities/team.entity'
import { CreateRewardDto } from './dto/create-reward.dto'
import { UpdateRewardDto } from './dto/update-reward.dto'
import { Reward, RewardAccess } from './entities/reward.entity'

type ParentIds = {
  organisationId?: string
  teamId?: string
}

@Injectable()
export class RewardsService {
  constructor(
    @InjectRepository(Reward)
    private rewardsRepository: Repository<Reward>
  ) {}

  create(createRewardDto: CreateRewardDto) {
    const { teamId, organisationId, imageId } = createRewardDto

    const reward = this.rewardsRepository.create(createRewardDto)

    // Set the image relationship
    if (imageId) {
      const image = new Image()
      image.id = imageId
      reward.image = image
    }

    if (teamId) {
      const team = new Team()
      team.id = teamId
      reward.team = team
      reward.access = RewardAccess.Team
    } else if (organisationId) {
      const organisation = new Organisation()
      organisation.id = organisationId
      reward.organisation = organisation
      reward.access = RewardAccess.Organisation
    }

    return this.rewardsRepository.save(reward)
  }

  async findManyAccessibleToUser(
    userId: string,
    { limit = 10, page = 0 }: PaginationOptionsInterface
  ) {
    const [results, total] = await this.queryFindAccessibleToUser(userId)
      .take(limit)
      .skip(page * limit)
      .getManyAndCount()

    return new Pagination<Reward>({
      results,
      total
    })
  }

  async findAll({ limit = 10, page = 0 }: PaginationOptionsInterface) {
    const [results, total] = await this.rewardsRepository.findAndCount({
      take: limit,
      skip: page * limit
    })

    return new Pagination<Reward>({
      results,
      total
    })
  }

  /**
   * Builds a query which determines:
   * 1. Whether the reward is public
   * 2. Whether the user belongs to the reward's team (if assigned)
   * 3. Whether the user belongs to a team within the reward's organisation (if assigned)
   *
   * This is used for fetching one and many rewards
   * for any user.
   *
   * @param userId
   * @returns
   */
  queryFindAccessibleToUser(userId: string) {
    return this.rewardsRepository
      .createQueryBuilder('reward')
      .leftJoinAndSelect('reward.image', 'image')
      .leftJoinAndSelect('reward.team', 'rewardTeam')
      .leftJoinAndSelect('reward.organisation', 'rewardOrganisation')
      .leftJoinAndSelect('rewardTeam.avatar', 'rewardTeamAvatar')
      .leftJoin('rewardTeam.users', 'teamUser')
      .leftJoinAndSelect(
        'rewardOrganisation.avatar',
        'rewardOrganisationAvatar'
      )
      .leftJoin('rewardOrganisation.teams', 'organisationTeam')
      .leftJoin('organisationTeam.users', 'organisationUser')

      .where(
        new Brackets((qb) => {
          // The league is public
          return (
            qb
              .where('reward.access = :accessPublic')

              // The user belongs to the team that the league belongs to
              .orWhere(
                `(reward.access = :accessTeam AND teamUser.id = :userId)`
              )

              // The user belongs to the organisation that the league belongs to
              .orWhere(
                `(reward.access = :accessOrganisation AND organisationUser.id = :userId)`
              )
          )
        }),
        {
          accessPublic: RewardAccess.Public,
          accessTeam: RewardAccess.Team,
          accessOrganisation: RewardAccess.Organisation,
          userId
        }
      )
      .orderBy('reward.reward_expires_at', 'ASC')
  }

  findOneAccessibleToUser(rewardId: string, userId: string) {
    return this.queryFindAccessibleToUser(userId)
      .andWhere('reward.id = :rewardId', { rewardId })
      .getOne()
  }

  findOne(rewardId: string) {
    return this.rewardsRepository.findOne(rewardId, {
      relations: ['image', 'team', 'organisation']
    })
  }

  /**
   * Updates a reward either by checking it against a team, organisation, or just the id
   * (in the case of a superadmin)
   *
   * Supports changing image
   *
   * @param rewardId
   * @param updateRewardDto
   * @param parentIds (team or organisation)
   * @returns
   */
  async update(
    rewardId: string,
    updateRewardDto: UpdateRewardDto,
    { teamId, organisationId }: ParentIds = {}
  ) {
    let image: Image
    const { imageId, ...fields } = updateRewardDto

    if (imageId) {
      image = new Image()
      image.id = imageId
    }

    if (teamId) {
      // Verify reward belongs to team
      if (!(await this.isTeamReward(rewardId, teamId))) {
        return false
      }

      return this.rewardsRepository.update(
        {
          id: rewardId
        },
        {
          ...fields,

          // Ensure access is correct
          access: RewardAccess.Team,

          // Ensure image is attached (if supplied)
          image
        }
      )
    }

    if (organisationId) {
      // Verify reward belongs to organisation
      if (!(await this.isOrganisationReward(rewardId, organisationId))) {
        return false
      }

      return this.rewardsRepository.update(
        {
          id: rewardId
        },
        {
          ...fields,

          // Ensure access is correct
          access: RewardAccess.Organisation,

          // Ensure image is attached (if supplied)
          image
        }
      )
    }

    return this.rewardsRepository.update(rewardId, {
      ...fields,
      image
    })
  }

  async isTeamReward(rewardId: string, teamId: string) {
    const reward = await this.rewardsRepository.findOne({
      id: rewardId,
      team: { id: teamId }
    })
    return !!reward
  }

  async isOrganisationReward(rewardId: string, organisationId: string) {
    const reward = await this.rewardsRepository.findOne({
      id: rewardId,
      organisation: { id: organisationId }
    })
    return !!reward
  }

  async remove(rewardId: string, { teamId, organisationId }: ParentIds = {}) {
    if (teamId) {
      // Verify reward belongs to team
      if (!(await this.isTeamReward(rewardId, teamId))) {
        return false
      }
    }

    if (organisationId) {
      // Verify reward belongs to organisation
      if (!(await this.isOrganisationReward(rewardId, organisationId))) {
        return false
      }
    }

    return this.rewardsRepository.delete({
      id: rewardId
    })
  }
}
