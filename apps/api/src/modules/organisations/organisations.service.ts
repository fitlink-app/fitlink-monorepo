import { Injectable } from '@nestjs/common'
import { Brackets, ILike, Repository } from 'typeorm'
import { CreateOrganisationDto } from './dto/create-organisation.dto'
import { UpdateOrganisationDto } from './dto/update-organisation.dto'
import { Organisation } from './entities/organisation.entity'
import { Image } from '../images/entities/image.entity'
import { Pagination, PaginationOptionsInterface } from '../../helpers/paginate'
import {
  OrganisationsInvitationsService,
  OrganisationsInvitationsServiceError
} from '../organisations-invitations/organisations-invitations.service'
import { OrganisationsInvitation } from '../organisations-invitations/entities/organisations-invitation.entity'
import { getManager } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { SearchOrganisationDto } from './dto/search-organisation.dto'
import { User, UserPublic, UserStat } from '../users/entities/user.entity'
import { CommonService } from '../common/services/common.service'
import { UserRolesService } from '../user-roles/user-roles.service'
import { Roles } from '../user-roles/user-roles.constants'
import { SubscriptionsService } from '../subscriptions/subscriptions.service'
import { TeamsService } from '../teams/teams.service'

@Injectable()
export class OrganisationsService {
  constructor(
    @InjectRepository(Organisation)
    private readonly organisationRepository: Repository<Organisation>,
    private readonly invitationsService: OrganisationsInvitationsService,
    private readonly commonService: CommonService,
    private readonly userRolesService: UserRolesService,
    private readonly subscriptionsService: SubscriptionsService,
    private readonly teamsService: TeamsService,
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async create(
    createOrganisationDto: CreateOrganisationDto,
    invitationOwnerId: string,
    createDefaults = false
  ) {
    const { email, invitee, imageId, ...rest } = createOrganisationDto

    let create: Partial<Organisation> = { ...rest }

    if (imageId) {
      create.avatar = new Image()
      create.avatar.id = imageId
    }

    const organisation = await this.organisationRepository.save(
      this.organisationRepository.create(create)
    )

    // Optionally invite a user by email
    let invitation: OrganisationsInvitation
    let inviteLink: string

    if (email) {
      const result = await this.invitationsService.create(
        organisation.id,
        {
          email,
          invitee,
          admin: true
        },
        invitationOwnerId
      )
      invitation = result.invitation
      inviteLink = result.inviteLink
    }

    return {
      organisation,
      invitation,
      inviteLink
    }
  }

  async signup(createOrganisationDto: CreateOrganisationDto, ownerId: string) {
    const { organisation } = await this.create(createOrganisationDto, ownerId)

    // Assign the user as admin
    await this.assignAdmin(organisation.id, ownerId)

    // Create the default subscription
    await this.subscriptionsService.createDefault(
      {
        billing_entity: organisation.name
      },
      organisation.id
    )

    // Create the default team
    const team = await this.teamsService.create(
      {
        name: organisation.name
      },
      organisation.id
    )

    // The owner should be a member of the team
    await this.teamsService.joinTeam(team.id, ownerId)

    return organisation
  }

  async findAll(
    { limit = 10, page = 0 }: PaginationOptionsInterface,
    filters: SearchOrganisationDto = {}
  ): Promise<Pagination<Organisation>> {
    let query = this.organisationRepository
      .createQueryBuilder('organisation')
      .leftJoinAndSelect('organisation.avatar', 'avatar')
      .take(limit)
      .skip(page * limit)

    if (filters.q) {
      query = query['where']('organisation.name ILIKE :name', {
        name: `%${filters.q}%`
      })
    }

    const [results, total] = await query.getManyAndCount()

    return new Pagination<Organisation>({
      results,
      total
    })
  }

  async findAllUsers(
    id: string,
    search: SearchOrganisationDto,
    options: PaginationOptionsInterface
  ): Promise<Pagination<UserPublic>> {
    let query = this.userRepository
      .createQueryBuilder('user')
      .innerJoin('user.teams', 'team')
      .innerJoin('team.organisation', 'organisation')
      .where('organisation.id = :id', { id })
      .take(options.limit)
      .skip(options.page * options.limit)

    if (search.q) {
      query = query.andWhere(
        new Brackets((qb) => {
          return qb.where('user.name ILIKE :q OR user.email = :email', {
            q: `%${search.q}%`,
            email: search.q.toLowerCase()
          })
        })
      )
    }

    const [results, total] = await query.getManyAndCount()

    return new Pagination<UserPublic>({
      results: this.commonService.mapUserPublic(results),
      total
    })
  }

  findOne(id: string) {
    return this.organisationRepository.findOne(id, {
      relations: ['teams', 'subscriptions']
    })
  }

  update(id: string, { imageId, ...rest }: UpdateOrganisationDto) {
    const update: Partial<Organisation> = { ...rest }

    if (imageId) {
      update.avatar = new Image()
      update.avatar.id = imageId

      // Explict removal of image
    } else if (imageId === null) {
      update.avatar = null
    }

    return this.organisationRepository.update(id, update)
  }

  async remove(id: string) {
    const organisation = await this.organisationRepository.findOne(id, {
      relations: ['subscriptions', 'invitations']
    })

    const result = await getManager().transaction(async (entityManager) => {
      // TODO delete teams, subscriptions, leagues, activities, etc.

      // Delete invitations
      if (organisation.invitations.length) {
        await entityManager.delete(
          OrganisationsInvitation,
          organisation.invitations.map((entity) => entity.id)
        )
      }

      // Finally, delete the organisation
      return await entityManager.delete(Organisation, organisation.id)
    })

    return result
  }

  /**
   * Verifies the token and responds to the invitation
   * either accepts or declines.
   *
   * @param token
   * @returns object (TeamInvitation)
   */

  async respondToInvitation(token: string, accept: boolean, userId: string) {
    const invitation = await this.invitationsService.verifyToken(token)

    if (typeof invitation === 'string') {
      return invitation
    }

    const roles = await this.userRolesService.getAllUserRoles(userId)

    const alreadyAdmin = roles.filter(
      (e) => e.organisation && e.organisation.id === invitation.organisation.id
    ).length

    // Delete the invitation if the user is already a member
    if (alreadyAdmin) {
      await this.invitationsService.remove(invitation.id)
      return invitation
    }

    if (accept) {
      await this.userRolesService.assignAdminRole(
        userId,
        {
          organisationId: invitation.organisation.id
        },
        false
      )
      return this.invitationsService.accept(invitation)
    } else {
      return this.invitationsService.decline(invitation)
    }
  }

  /**
   * Assign admin role to organisation
   */
  async assignAdmin(organisationId: string, userId: string) {
    return this.userRolesService.assignAdminRole(
      userId,
      { organisationId },
      false
    )
  }

  async queryUserOrganisationStats(
    organisationId: string,
    options?: PaginationOptionsInterface
  ) {
    const results: UserStat[] = await this.userRepository.manager.query(
      `
      SELECT
        u."id",
        u."name",
        u."points_total",
        u."rank",
        u."created_at",
        u."updated_at",
        u."last_app_opened_at",
        image."url_128x128",
        jsonb_agg(to_jsonb("provider"."type")) AS "provider_types",
        jsonb_agg(DISTINCT "u_ha") AS "latest_health_activity",
        COUNT("league_count") AS "league_count",
        COUNT("reward_count") AS "reward_count",
        count(*) OVER() AS total

      FROM "user" AS u
      LEFT JOIN "image" ON u."avatarId" = "image"."id"
      INNER JOIN "team_users_user" tu ON tu."userId" = u."id"
      INNER JOIN "team" AS team ON tu."teamId" = team."id"
      INNER JOIN "organisation" org ON org."id" = team."organisationId"
      LEFT JOIN "provider" ON "provider"."userId" = u."id"
      LEFT JOIN LATERAL (
        SELECT ha.*, sport.name AS sport_name, sport.name_key AS sport_name_key
        FROM health_activity ha
        INNER JOIN sport ON sport.id = ha."sportId"
        WHERE ha."userId" = u."id"
        GROUP BY ha."id", sport."name", sport."name_key"
        ORDER BY ha."created_at" DESC
        LIMIT 1
      ) "u_ha" ON u_ha."userId" = u."id"
      LEFT JOIN LATERAL (
        SELECT COUNT(*) FROM league
        INNER JOIN league_users_user lu ON lu."leagueId" = league."id"
        WHERE lu."userId" = u."id" AND league."teamId" = $1
        AND (league.repeat = true OR league.ends_at > NOW())
        GROUP BY lu."userId"
      ) "league_count" ON true
      LEFT JOIN LATERAL (
        SELECT COUNT(*) FROM reward
        INNER JOIN rewards_redemption re ON re."rewardId" = reward."id"
        WHERE re."userId" = u."id"
        GROUP BY re."userId"
      ) "reward_count" ON true
      WHERE org."id" = $1
      GROUP BY "u"."id", "image"."id"
      LIMIT $2
      OFFSET $3
    `,
      [organisationId, options.limit, options.page * options.limit]
    )

    const count = Number(results[0] ? (results[0] as any).total : 0)

    return new Pagination<UserStat>({
      results: results.map((each: UserStat & { name: string }) => {
        const [firstName, lastName] = each.name.split(' ')
        return {
          ...each,
          name: undefined,
          initials: firstName[0] + (lastName ? lastName[0] : ''),
          league_count: Number(each.league_count),
          reward_count: Number(each.reward_count),
          total: undefined
        } as UserStat
      }),
      total: count || results.length
    })
  }
}
