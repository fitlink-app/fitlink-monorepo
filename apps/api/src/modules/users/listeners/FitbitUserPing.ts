import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import {
  FeedItemCategory,
  FeedItemType
} from '../../feed-items/feed-items.constants'
import { FeedItemsService } from '../../feed-items/feed-items.service'
import { User } from '../entities/user.entity'
import { Events } from '../../../../src/events'
import { NotificationsService } from '../../notifications/notifications.service'
import { NotificationAction } from '../../notifications/notifications.constants'
import { AuthenticatedUser } from '../../../models'
import { tryAndCatch } from '../../../helpers/tryAndCatch'
import { FitbitService } from '../../providers/providers/fitbit/fitbit.service'
import { LifestyleGoalActivityDTO } from '../../providers/types/fitbit'

@Injectable()
export class FitbitUserListener {
  constructor(private fitbit: FitbitService) {}
  @OnEvent(Events.USER_PING)
  async onUserPingEvent(payload: AuthenticatedUser) {
    const [token, tokenErr] = await tryAndCatch(
      this.fitbit.getFreshFitbitToken(payload.id)
    )

    tokenErr && console.error(tokenErr.message)

    // Do not continue if there's no token available
    if (tokenErr) {
      return
    }

    const [summaryResult, summaryResultErr] = await tryAndCatch(
      this.fitbit.fetchActivitySummaryByDay(token, new Date().toUTCString())
    )

    // Do not continue if there's an error
    if (summaryResultErr) {
      return
    }

    const lifestyleStats: LifestyleGoalActivityDTO = {
      steps: summaryResult.summary.steps || 0,
      floors_climbed: summaryResult.summary.floors || 0,
      sleep_hours: 0,
      water_litres: 0,
      mindfulness: 0
    }
    await this.fitbit.prcoessDailyGoalsHistory(payload.id, lifestyleStats)
  }
}
