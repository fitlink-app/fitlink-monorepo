import { Test } from '@nestjs/testing'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigService } from '@nestjs/config'
import {
  FastifyAdapter,
  NestFastifyApplication
} from '@nestjs/platform-fastify'
import { ValidationPipe } from '@nestjs/common'

import { Activity } from '../../src/modules/activities/entities/activity.entity'
import { HealthActivity } from '../../src/modules/health-activities/entities/health-activity.entity'
import { FeedItem } from '../../src/modules/feed-items/entities/feed-item.entity'
import { Following } from '../../src/modules/followings/entities/following.entity'
import { GoalsEntry } from '../../src/modules/goals-entries/entities/goals-entry.entity'
import { Image } from '../../src/modules/images/entities/image.entity'
import { Leaderboard } from '../../src/modules/leaderboards/entities/leaderboard.entity'
import { LeaderboardEntry } from '../../src/modules/leaderboard-entries/entities/leaderboard-entry.entity'
import { LeaguesInvitation } from '../../src/modules/leagues-invitations/entities/leagues-invitation.entity'
import { League } from '../../src/modules/leagues/entities/league.entity'
import { Organisation } from '../../src/modules/organisations/entities/organisation.entity'
import { Provider } from '../../src/modules/providers/entities/provider.entity'
import { RefreshToken } from '../../src/modules/auth/entities/auth.entity'
import { Reward } from '../../src/modules/rewards/entities/reward.entity'
import { RewardsRedemption } from '../../src/modules/rewards-redemptions/entities/rewards-redemption.entity'
import { Sport } from '../../src/modules/sports/entities/sport.entity'
import { Team } from '../../src/modules/teams/entities/team.entity'
import { TeamsInvitation } from '../../src/modules/teams-invitations/entities/teams-invitation.entity'
import { User } from '../../src/modules/users/entities/user.entity'
import { UsersSetting } from '../../src/modules/users-settings/entities/users-setting.entity'
import { mockConfigService, mockConfigServiceProvider } from './mocking'

export const entities = [
  Activity,
  Following,
  FeedItem,
  GoalsEntry,
  HealthActivity,
  Image,
  Leaderboard,
  LeaderboardEntry,
  League,
  LeaguesInvitation,
  Organisation,
  Provider,
  RefreshToken,
  Reward,
  RewardsRedemption,
  Sport,
  Team,
  TeamsInvitation,
  User,
  UsersSetting
]

export async function mockApp(
  { imports = [], providers = [], controllers = [] },
  name = 'default'
) {
  const moduleRef = await Test.createTestingModule({
    imports: [
      ...imports,
      TypeOrmModule.forRoot({
        name,
        type: 'postgres',
        username: 'jest',
        password: 'jest',
        database: 'jest',
        host: 'localhost',
        port: 5432,
        entities,
        dropSchema: false,
        synchronize: false,
        migrationsRun: false
      })
    ],
    providers: [...providers, mockConfigServiceProvider()],
    controllers
  })
    .overrideProvider(ConfigService)
    .useValue(mockConfigService())
    .compile()

  const app = moduleRef.createNestApplication<NestFastifyApplication>(
    new FastifyAdapter()
  )

  app.useGlobalPipes(new ValidationPipe())
  await app.init()
  await app.getHttpAdapter().getInstance().ready()

  return app
}
