import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from '../../users/entities/user.entity'
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
    private leaguesRepository: Repository<League>,

    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  @OnEvent('health_activity.created')
  async updateUserPointsInLeague(payload: HealthActivityCreatedEvent) {
    const healthActivity = await this.healthActivityRepository.findOne(
      payload.health_activity_id,
      { relations: ['sport', 'user'] }
    )

    // Update User
    await this.userRepository.increment(
      { id: healthActivity.user.id },
      'points_total',
      healthActivity.points
    )

    // Update Leagues
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
