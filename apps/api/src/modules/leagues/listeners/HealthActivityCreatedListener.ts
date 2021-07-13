import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { HealthActivity } from '../../health-activities/entities/health-activity.entity'
import { HealthActivityCreatedEvent } from '../../health-activities/events/health-activity-created.event'
import { LeaderboardEntry } from '../../leaderboard-entries/entities/leaderboard-entry.entity'
import { League } from '../entities/league.entity'

@Injectable()
export class HealthActivityCreatedListener {
  constructor(
    @InjectRepository(HealthActivity)
    private healthActivityRepository: Repository<HealthActivity>,

    @InjectRepository(LeaderboardEntry)
    private leaderboardEntriesRepository: Repository<LeaderboardEntry>,

    @InjectRepository(League)
    private leaguesRepository: Repository<League>
  ) {}

  @OnEvent('health_activity.created')
  async updateUserPointsInLeague(payload: HealthActivityCreatedEvent) {
    const healthActivity = await this.healthActivityRepository.findOne(
      payload.health_activity_id,
      { relations: ['sport', 'user'] }
    )
    const leagues = await this.leaguesRepository.find({
      where: { sport: healthActivity.sport },
      relations: ['active_leaderboard', 'users']
    })

    const incrementEntryPromises = []

    for (const league of leagues) {
      incrementEntryPromises.push(
        this.leaderboardEntriesRepository.increment(
          {
            leaderboard: { id: league.active_leaderboard.id },
            user: { id: healthActivity.user.id }
          },

          'points',
          healthActivity.points
        )
      )
    }

    await Promise.all(incrementEntryPromises)
    await this.healthActivityRepository.save({
      ...healthActivity,
      distributed: true
    })
  }
}
