import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Pagination, PaginationOptionsInterface } from '../../helpers/paginate'
import { AuthenticatedUser } from '../../models'
import { Image } from '../images/entities/image.entity'
import { Organisation } from '../organisations/entities/organisation.entity'
import { Subscription } from '../subscriptions/entities/subscription.entity'
import { BillingPlanStatus } from '../subscriptions/subscriptions.constants'
import { TeamsInvitation } from '../teams-invitations/entities/teams-invitation.entity'
import { TeamsInvitationsService } from '../teams-invitations/teams-invitations.service'
import { UserRolesService } from '../user-roles/user-roles.service'
import { User, UserStat } from '../users/entities/user.entity'
import { CreateTeamDto } from './dto/create-team.dto'
import { DateQueryDto } from './dto/date-query.dto'
import { UpdateTeamDto } from './dto/update-team.dto'
import { Team } from './entities/team.entity'

export enum TeamServiceError {
  AlreadyMember = 'You are already a member of this team',
  TeamNotExist = 'Team does not exist'
}

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team)
    private teamRepository: Repository<Team>,
    @InjectRepository(Organisation)
    private organisationRepository: Repository<Organisation>,
    private userRolesService: UserRolesService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(TeamsInvitation)
    private teamInvitationRepository: Repository<TeamsInvitation>,
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,

    private teamInvitationService: TeamsInvitationsService,
    private configService: ConfigService
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

    // Create unique join code
    fields.join_code = await this.generateJoinCode()

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
        },
        relations: ['organisation', 'organisation.subscriptions', 'avatar']
      })
    }
    return await this.teamRepository.findOne(id, {
      relations: ['organisation', 'organisation.subscriptions', 'avatar']
    })
  }

  async findOneByCode(code: string) {
    return await this.teamRepository.findOne(
      {
        join_code: code
      },
      {
        relations: ['avatar']
      }
    )
  }

  async update(
    id: string,
    { name, imageId }: UpdateTeamDto,
    organisationId?: string
  ) {
    let image: Image
    const update: Partial<Team> = { name }
    if (imageId) {
      update.avatar = new Image()
      update.avatar.id = imageId
    }

    if (organisationId) {
      const isOwner = !!(await this.findOne(id, organisationId))
      if (!isOwner) {
        throw new UnauthorizedException(
          "That team doesn't belong to this organisation"
        )
      }
      return await this.teamRepository.save({
        id,
        image,
        ...update
      })
    }
    return await this.teamRepository.save({
      id,
      ...update
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

  async deleteUserFromTeam(teamId: string, userId: string) {
    await this.removeFromTeam(teamId, userId)
  }

  /**
   * Join a user to a team
   * without their express consent
   * (e.g. for automatically generating team participation from signup)

   * @param teamId
   * @param userId
   * @returns
   */
  async joinTeam(teamId: string, userId: string) {
    await this.addToTeam(teamId, userId)
    return true
  }

  async addToTeam(teamId: string, userId: string) {
    await this.teamRepository
      .createQueryBuilder('team')
      .relation(Team, 'users')
      .of(teamId)
      .add(userId)

    // Increment the count
    await this.teamRepository.increment({ id: teamId }, 'user_count', 1)

    // Setup subscriptions
    await this.updateTeamUsersSubscription(teamId, userId)
  }

  async removeFromTeam(teamId: string, userId: string) {
    await this.userRepository
      .createQueryBuilder('users')
      .relation(User, 'teams')
      .of(userId)
      .remove(teamId)

    // Decrement the count
    await this.teamRepository.decrement({ id: teamId }, 'user_count', 1)

    // Remove user from a subscription if necessary
    await this.removeTeamUserSubscription(userId)
  }

  /**
   * Ensure the user joining the team will be set to the default
   * subscription of the organisation.
   *
   * If they're already part of an existing active subscription, this step
   * is skipped.
   *
   * @param token
   * @param userId
   * @returns
   */
  async updateTeamUsersSubscription(teamId: string, userId: string) {
    const team = await this.findOne(teamId)
    const user = await this.userRepository.findOne(userId, {
      relations: ['subscription', 'teams', 'teams.organisation']
    })

    // Skip if the user is already on an active subscription
    // This could even be a subscription on a different organisation
    // However this implies that a different organisation will be paying for this user.
    // In future we may need a way to store multiple subscriptions on a single user.
    if (
      user.subscription &&
      user.subscription.billing_plan_status === BillingPlanStatus.Active
    ) {
      return true
    }

    // If the user only belongs to this team, the organisation count should be incremented
    if (user.teams.length === 1) {
      await this.organisationRepository.increment(
        { id: team.organisation.id },
        'user_count',
        1
      )
    }

    // Or add them to the default subscription
    const defaultSubscription = team.organisation.subscriptions.filter(
      (e) => e.default
    )[0]

    if (defaultSubscription) {
      user.subscription = defaultSubscription
      await this.userRepository.save(user)
      await this.subscriptionRepository.increment(
        { id: user.subscription.id },
        'user_count',
        1
      )
      return true
    }

    return false
  }

  /**
   * Remove team member from subscriptions
   * @param token
   * @param userId
   * @returns
   */
  async removeTeamUserSubscription(userId: string) {
    const user = await this.getUserWithTeams(userId)

    // Remove user from subscription if they no longer belong to any teams
    // within the subscription's organisation
    const exists = user.teams.filter(
      (e) => e.organisation.id === user.subscription.organisation.id
    )
    if (exists.length === 0) {
      const subscription = user.subscription
      if (subscription) {
        user.subscription = null
        await this.userRepository.save(user)
        await this.subscriptionRepository.decrement(
          { id: subscription.id },
          'user_count',
          1
        )
        await this.organisationRepository.increment(
          { id: subscription.organisation.id },
          'user_count',
          1
        )
      }
    }

    return true
  }

  /**
   * Join team from a token
   *
   * @param invitation
   * @param userId
   * @returns
   */
  async joinTeamFromToken(token: string, userId: string) {
    const invitation = await this.teamInvitationService.verifyToken(token)

    if (typeof invitation === 'string') {
      return invitation
    }

    const user = await this.userRepository.findOne(userId)

    await this.addToTeam(invitation.team.id, userId)

    invitation.resolved_user = user
    return this.teamInvitationRepository.save(invitation)
  }

  /**
   * Join team from an invitation already provided.
   *
   * @param invitation
   * @param userId
   * @returns
   */
  async joinTeamFromInvitation(invitation: TeamsInvitation, userId: string) {
    const user = await this.userRepository.findOne(userId)

    await this.teamRepository
      .createQueryBuilder('team')
      .relation(Team, 'users')
      .of(invitation.team.id)
      .add(user)

    await this.addToTeam(invitation.team.id, userId)

    invitation.resolved_user = user
    return this.teamInvitationRepository.save(invitation)
  }

  /**
   * Verifies the token and responds to the invitation
   * either accepts or declines.
   *
   * @param token
   * @returns object (TeamInvitation)
   */

  async respondToInvitation(token: string, accept: boolean, userId: string) {
    const invitation = await this.teamInvitationService.verifyToken(token)

    if (typeof invitation === 'string') {
      return invitation
    }

    // Admin invitations do not join teams
    if (invitation.admin) {
      if (accept) {
        await this.userRolesService.assignAdminRole(userId, {
          teamId: invitation.team.id
        })
        return this.teamInvitationService.accept(invitation)
      } else {
        return this.teamInvitationService.decline(invitation)
      }
    }

    const user = await this.userRepository.findOne(userId, {
      relations: ['teams']
    })

    const alreadyMember = user.teams.filter((e) => e.id === invitation.team.id)
      .length

    // Delete the invitation if the user is already a member
    if (alreadyMember) {
      await this.teamInvitationService.remove(invitation.id)
      return TeamServiceError.AlreadyMember
    }

    if (accept) {
      invitation.accepted = true
      return this.joinTeamFromInvitation(invitation, userId)
    } else {
      return this.teamInvitationService.decline(invitation)
    }
  }

  async getUserWithTeams(userId: string) {
    const user = await this.userRepository.findOne(userId, {
      relations: [
        'teams',
        'teams.organisation',
        'teams.organisation.subscriptions'
      ]
    })

    return user
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

  async queryPopularActivities(
    teamId: string,
    { start_at, end_at }: DateQueryDto
  ) {
    const params: string[] = [teamId]

    if (start_at) {
      params.push(start_at)
    }

    if (end_at) {
      params.push(end_at)
    }

    const results = await this.userRepository.manager.query(
      `
      SELECT COUNT(*) AS count, sport.*
      FROM health_activity
      INNER JOIN "user" "u" ON "u"."id" = health_activity."userId"
      INNER JOIN "team_users_user" tu ON tu."userId" = u."id"
      INNER JOIN "team" AS team ON tu."teamId" = team."id"
      INNER JOIN "sport" ON sport."id" = health_activity."sportId"
      AND team."id" = $1
      ${start_at ? ' AND health_activity."created_at" > $2 ' : ''}
      ${end_at ? ' AND health_activity."created_at" < $2 ' : ''}
      GROUP BY sport."id"
      ORDER BY count DESC
    `,
      params
    )

    return new Pagination<any>({
      total: results.length,
      results: results
    })
  }

  async generateJoinCode(): Promise<string> {
    const joinCode = Math.floor(Date.now() * Math.random())
      .toString(36)
      .substr(0, 6)
      .toUpperCase()
      .replace('O', '0')

    // Join code uniqueness
    if (
      (await this.teamRepository.count({
        where: {
          join_code: joinCode
        }
      })) > 0
    ) {
      return this.generateJoinCode()
    }

    return joinCode
  }

  async updateJoinCode(teamId: string) {
    const code = await this.generateJoinCode()
    await this.teamRepository.update(teamId, {
      join_code: code
    })
    return {
      code
    }
  }

  async getInviteLink(teamId: string) {
    const team = await this.teamRepository.findOne(teamId)
    return {
      url: `${this.configService.get('SHORT_URL')}/join/${team.join_code}`
    }
  }

  async joinTeamFromCode(code: string, userId: string) {
    const team = await this.teamRepository.findOne({
      where: {
        join_code: code
      }
    })
    if (!team) {
      return TeamServiceError.TeamNotExist
    }
    return this.joinTeam(team.id, userId)
  }
}
