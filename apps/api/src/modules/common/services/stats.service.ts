import { Injectable, UnauthorizedException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import {
  Pagination,
  PaginationOptionsInterface
} from '../../../helpers/paginate'
import { User } from '../../users/entities/user.entity'
import { DateQueryDto } from '../dto/date-query.dto'
import { GoalQueryDto } from '../dto/goal-query.dto'

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async queryGlobalStats(
    entityId: string,
    type: 'app' | 'organisation' | 'team'
  ) {
    const params: string[] = []
    let leagueJoins = ''
    let leagueWhere = ''
    let rewardJoins = ''
    let rewardWhere = ''

    if (type === 'organisation' || type === 'team') {
      params.push(entityId)
      leagueJoins = `
        INNER JOIN "team" ON league."teamId" = team."id"
      `
      rewardJoins = `
        INNER JOIN "team" ON reward."teamId" = team."id"
      `
      leagueWhere = `
        WHERE team."id" = $1
      `
      rewardWhere = `
        WHERE team."id" = $1
      `
      if (type === 'organisation') {
        leagueJoins = `
          INNER JOIN "organisation" "org" ON league."organisationId" = org."id"
        `
        leagueWhere = `
          WHERE org."id" = $1
        `
        rewardJoins = `
          INNER JOIN "organisation" "org" ON reward."organisationId" = org."id"
        `
        rewardWhere = `
          WHERE org."id" = $1
        `
      }
    }

    const query = `
      SELECT (
        SELECT COUNT (*) AS count
        FROM "league" "league"
        ${leagueJoins}
        ${leagueWhere}
      ) AS league_count,
      (
        SELECT COUNT (*) AS count
        FROM "reward" "reward"
        ${rewardJoins}
        ${rewardWhere}
      ) AS reward_count
    `

    const results: any[] = await this.userRepository.manager.query(
      query,
      params
    )

    return {
      league_count: Number(results[0].league_count),
      reward_count: Number(results[0].reward_count)
    }
  }

  async queryPopularLeagues(
    entityId: string,
    type: 'app' | 'organisation' | 'team',
    { start_at, end_at, exclude_zero_values }: GoalQueryDto
  ) {
    const params: string[] = [start_at, end_at]
    let joins = ''
    let where = ''

    if (type === 'organisation' || type === 'team') {
      params.push(entityId)

      if (type === 'team') {
        joins += `
          INNER JOIN "league_users_user" "u" ON "u"."leagueId" = "league"."id"
          INNER JOIN "team" ON league."teamId" = team."id"
          INNER JOIN "team_users_user" "tu" ON tu."userId" = u."userId"
        `
      }

      if (type === 'organisation') {
        joins += `
          INNER JOIN "organisation" "org" ON league."organisationId" = org."id"
          INNER JOIN "team" ON team."organisationId" = org."id"
          INNER JOIN "league_users_user" "u" ON "u"."leagueId" = "league"."id"
          INNER JOIN "team_users_user" "tu" ON tu."userId" = u."userId"
        `
      }

      if (type === 'team') {
        where += `
          AND team."id" = $3 AND league."teamId" = team."id"
        `
      }

      if (type === 'organisation') {
        where += `
          AND org."id" = $3 AND league."organisationId" = org."id"
        `
      }
    }

    const query = `
      SELECT "league".*, "image"."url" AS "image_url", "sport"."name" AS "sport"
      FROM "league" "league"
      LEFT JOIN "image" ON "league"."imageId" = "image"."id"
      LEFT JOIN "sport" ON "league"."sportId" = "sport"."id"
      ${joins}
      WHERE "league"."participants_total" > 0
      AND (
        ("league"."repeat" = true AND ("league"."created_at" <= $2 ))
        OR
        ("league"."repeat" = false AND "league"."created_at" >= $1 AND "league"."ends_at" <= $2 )
      )
      ${where}
      GROUP BY "league"."id", "image"."url", "sport"."name"
      ORDER BY "league"."participants_total" DESC
    `

    const results: any[] = await this.userRepository.manager.query(
      query,
      params
    )

    return results
  }

  async queryPopularRewards(
    entityId: string,
    type: 'app' | 'organisation' | 'team',
    { start_at, end_at, exclude_zero_values }: GoalQueryDto
  ) {
    const params: string[] = [start_at, end_at]
    let joins = ''
    let where = ''

    if (type === 'organisation' || type === 'team') {
      params.push(entityId)
      joins += `
        INNER JOIN "team" ON reward."teamId" = team."id"
      `

      if (type === 'team') {
        where += `
          AND team."id" = $3 AND reward."teamId" = team."id"
        `
      }

      if (type === 'organisation') {
        joins += `
          INNER JOIN "organisation" "org" ON team."organisationId" = org."id"
        `
        where += `
          AND org."id" = $3 AND reward."organisationId" = org."id"
        `
      }
    }

    const query = `
      SELECT "reward".*, "image"."url" AS "image_url", "redeemed"."count" AS "redeem_count"
      FROM "reward" "reward"
      LEFT JOIN "image" ON "reward"."imageId" = "image"."id"
      LEFT JOIN (
        SELECT COUNT(*) AS "count", "redeem"."rewardId"
        FROM "rewards_redemption" "redeem"
        INNER JOIN "reward" "reward" ON "redeem"."rewardId" = "reward"."id"
        WHERE "redeem"."created_at" >= $1 AND "redeem"."created_at" <= $2
        GROUP BY "redeem"."rewardId"
      ) AS redeemed ON "redeemed"."rewardId" = "reward"."id"
      ${joins}
      WHERE "redeemed"."count" > 0
      ${where}
      GROUP BY "reward"."id", "redeemed"."count", "image_url"
      ORDER BY "redeemed"."count" DESC
    `

    const results: any[] = await this.userRepository.manager.query(
      query,
      params
    )

    return results
  }

  async queryDailyGoals(
    entityId: string,
    type: 'app' | 'organisation' | 'team',
    { start_at, end_at, exclude_zero_values }: GoalQueryDto
  ) {
    const params: string[] = [start_at, end_at]
    let joins = ''
    let where = ''

    if (type === 'organisation' || type === 'team') {
      params.push(entityId)
      joins += `
        INNER JOIN "team_users_user" "tu" ON tu."userId" = u."id"
        INNER JOIN "team" ON tu."teamId" = team."id"
      `

      if (type === 'team') {
        where += `
          AND team."id" = $3
        `
      }

      if (type === 'organisation') {
        joins += `
          INNER JOIN "organisation" "org" ON team."organisationId" = org."id"
        `
        where += `
          AND org."id" = $3
        `
      }
    }

    const goals = [
      'steps',
      'sleep_hours',
      'mindfulness_minutes',
      'active_minutes',
      'floors_climbed',
      'water_litres'
    ]

    let query = goals
      .map((each) => {
        return `
        (
          SELECT FLOOR(AVG(goal_${each})) AS goal_${each}
          FROM "user" "u"
          ${joins}
          WHERE (u."created_at" < $2)
          ${where}
          ${!exclude_zero_values ? ` AND goal_${each} > 0 ` : ''}
        ) AS goal_${each},
        (
          SELECT FLOOR(AVG(current_${each})) AS current_${each}
          FROM "goals_entry"
          INNER JOIN "user" "u" ON "goals_entry"."userId" = "u"."id"
          ${joins}
          WHERE "goals_entry"."created_at" >= $1 AND "goals_entry"."created_at" <= $2
          ${where}
          ${!exclude_zero_values ? ` AND current_${each} > 0 ` : ''}
        ) AS current_${each}
      `
      })
      .join(',')

    const activeUserQuery = `
      (
        SELECT COUNT(*) FROM (
          SELECT DISTINCT "u"."id"
          FROM "user" "u"
          INNER JOIN "goals_entry" "g" ON "g"."userId" = "u"."id"
          ${joins}
          WHERE "g"."created_at" >= $1 AND "g"."created_at" <= $2 AND (
            "g"."current_steps" > 0
            OR "g"."current_mindfulness_minutes" > 0
            OR "g"."current_floors_climbed" > 0
            OR "g"."current_water_litres" > 0
            OR "g"."current_sleep_hours" > 0
            OR "g"."current_active_minutes" > 0
          )
          ${where}
          GROUP BY "u"."id"
        ) AS count
      ) as user_active_count,
      (
        SELECT COUNT(*) FROM (
          SELECT DISTINCT "u"."id"
          FROM "user" "u"
          ${joins}
          ${where}
          GROUP BY "u"."id"
        ) AS count
      ) AS user_total_count`

    query = `SELECT ${query}, ${activeUserQuery}`

    const results: any[] = await this.userRepository.manager.query(
      query,
      params
    )

    console.log(query)

    return results[0]
  }

  async queryPopularActivities(
    entityId: string,
    type: 'app' | 'organisation' | 'team',
    { start_at, end_at }: DateQueryDto
  ) {
    const params: string[] = [start_at, end_at]

    let conditions = ''
    let where = ''

    if (type === 'organisation' || type === 'team') {
      params.push(entityId)
    }

    if (type === 'team') {
      conditions = `
        INNER JOIN "team_users_user" tu ON tu."userId" = u."id"
        INNER JOIN "team" AS team ON tu."teamId" = team."id"
      `
      where = `
        WHERE team."id" = $3
      `
    }

    if (type === 'organisation') {
      conditions = `
        INNER JOIN "team_users_user" tu ON tu."userId" = u."id"
        INNER JOIN "team" AS team ON tu."teamId" = team."id"
        INNER JOIN "organisation" AS org ON "team"."organisationId" = org."id"
      `
      where = `
        WHERE org."id" = $3
      `
    }

    // Construct final query
    const query = `
      SELECT COUNT(*) AS count, sport.*
      FROM health_activity
      INNER JOIN "user" "u" ON "u"."id" = health_activity."userId"
      INNER JOIN "sport" ON sport."id" = health_activity."sportId"
      ${conditions}${where}
      AND health_activity."created_at" >= $1
      AND health_activity."created_at" <= $2
      GROUP BY sport."id"
      ORDER BY count DESC
    `

    const results = await this.userRepository.manager.query(query, params)

    return new Pagination<any>({
      total: results.length,
      results: results
    })
  }
}
