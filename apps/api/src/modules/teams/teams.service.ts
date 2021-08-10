import { Injectable, UnauthorizedException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Pagination, PaginationOptionsInterface } from '../../helpers/paginate'
import { AuthenticatedUser } from '../../models'
import { Organisation } from '../organisations/entities/organisation.entity'
import { TeamsInvitation } from '../teams-invitations/entities/teams-invitation.entity'
import { TeamsInvitationsService } from '../teams-invitations/teams-invitations.service'
import { User, UserStat } from '../users/entities/user.entity'
import { CreateTeamDto } from './dto/create-team.dto'
import { UpdateTeamDto } from './dto/update-team.dto'
import { Team } from './entities/team.entity'

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team)
    private teamRepository: Repository<Team>,
    @InjectRepository(Organisation)
    private organisationRepository: Repository<Organisation>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(TeamsInvitation)
    private teamInvitationRepository: Repository<TeamsInvitation>,

    private teamInvitationService: TeamsInvitationsService
  ) {}

  /**
   * Creates a team and assigns it to an organisation.
   * @param createTeamDto
   * @param organisationId
   * @returns
   */
  async create(fields: Partial<Team>, organisationId: string) {
    fields.organisation = new Organisation()
    fields.organisation.id = organisationId

    // Set it as the team organisation
    const team = await this.teamRepository.save(
      this.teamRepository.create(fields)
    )

    return team
  }

  async findAll(options?: PaginationOptionsInterface, organisationId?: string) {
    const { limit, page } = options
    const [results, total] = await this.teamRepository.findAndCount({
      where: organisationId
        ? {
            organisation: { id: organisationId }
          }
        : undefined,
      relations: ['avatar'],
      take: limit,
      skip: limit * page
    })

    return new Pagination<Team>({
      results: results,
      total
    })
  }

  async findOne(id: string, organisationId?: string) {
    if (organisationId) {
      return await this.teamRepository.findOne({
        where: {
          id,
          organisation: { id: organisationId }
        }
      })
    }
    return await this.teamRepository.findOne(id)
  }

  async update(
    id: string,
    updateTeamDto: UpdateTeamDto,
    organisationId?: string
  ) {
    if (organisationId) {
      const isOwner = !!(await this.findOne(id, organisationId))
      if (!isOwner) {
        throw new UnauthorizedException(
          "That team doesn't belong to this organisation"
        )
      }
      return await this.teamRepository.save({
        id,
        ...updateTeamDto
      })
    }
    return await this.teamRepository.save({
      id,
      ...updateTeamDto
    })
  }

  async removeAvatar(id: string) {
    return await this.teamRepository.save({
      id,
      avatar: null
    })
  }

  async remove(id: string, organisationId: string) {
    return await this.teamRepository.delete({
      id,
      organisation: {
        id: organisationId
      }
    })
  }

  async getAllUsersFromTeam(
    organisationId: string,
    teamId: string
  ): Promise<User[] | []> {
    const team = await this.teamRepository.findOne({
      where: { id: teamId, organisation: { id: organisationId } },
      relations: ['users']
    })
    if (!!!team) {
      throw new UnauthorizedException(`Team with ID: ${teamId} Not Found`)
    }
    return team.users
  }
  async deleteUserFromTeam(
    organisationId: string,
    teamId: string,
    userId: string
  ) {
    const isOwner = !!(await this.findOne(teamId, organisationId))
    if (!isOwner) {
      throw new UnauthorizedException(
        "That team doesn't belong to this organisation"
      )
    }
    return await this.userRepository
      .createQueryBuilder('users')
      .relation(User, 'teams')
      .of(userId)
      .remove(teamId)
  }

  async joinTeam(token: string, authenticated_user: AuthenticatedUser) {
    const invitation = (await this.teamInvitationService.verifyToken(
      token
    )) as TeamsInvitation

    const user = await this.userRepository.findOne(authenticated_user.id)

    await this.teamRepository
      .createQueryBuilder('team')
      .relation(Team, 'users')
      .of(invitation.team.id)
      .add(user)

    invitation.resolved_user = user
    const savedInvitation = await this.teamInvitationRepository.save(invitation)

    return savedInvitation
  }

  async queryUserTeamStats(
    teamId: string,
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
      WHERE team."id" = $1
      GROUP BY "u"."id", "image"."id"
      LIMIT $2
      OFFSET $3
    `,
      [teamId, options.limit, options.page * options.limit]
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
