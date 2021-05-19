import { Reflector } from '@nestjs/core'
import { Test } from '@nestjs/testing'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigService } from '@nestjs/config'
import {
  FastifyAdapter,
  NestFastifyApplication
} from '@nestjs/platform-fastify'
import { ValidationPipe } from '@nestjs/common'
import fastifyMultipart from 'fastify-multipart'

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
import { Subscription } from '../../src/modules/subscriptions/entities/subscription.entity'
import { UserRole } from '../../src/modules/user-roles/entities/user-role.entity'
import {
  mockConfigService,
  mockConfigServiceProvider,
  mockEmailService
} from './mocking'
import { UploadGuard } from '../../src/guards/upload.guard'
import { JwtAuthGuard } from '../../src/modules/auth/guards/jwt-auth.guard'
import { IamGuard } from '../../src/guards/iam.guard'
import { EmailService } from '../../src/modules/common/email.service'
import { OrganisationsInvitation } from '../../src/modules/organisations-invitations/entities/organisations-invitation.entity'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { Queueable } from '../../src/modules/queue/entities/queueable.entity'

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
  OrganisationsInvitation,
  Provider,
  Queueable,
  RefreshToken,
  Reward,
  RewardsRedemption,
  Sport,
  Subscription,
  Team,
  TeamsInvitation,
  User,
  UserRole,
  UsersSetting
]

export async function mockApp({
  imports = [],
  providers = [],
  controllers = []
}) {
  const moduleRef = Test.createTestingModule({
    imports: [
      ...imports,
      EventEmitterModule.forRoot(),
      TypeOrmModule.forRoot({
        name: 'default',
        type: 'postgres',
        username: 'jest',
        password: 'jest',
        database: 'jest',
        host: 'localhost',
        port: 5433,
        entities,
        dropSchema: false,
        synchronize: false,
        migrationsRun: false
      })
    ],
    providers: [...providers, mockConfigServiceProvider()],
    controllers
  })

  const overrideRef = moduleRef
    .overrideProvider(ConfigService)
    .useValue(mockConfigService())
    .overrideProvider(EmailService)
    .useValue(mockEmailService())

  const result = await overrideRef.compile()

  const fastifyAdapter = new FastifyAdapter()
  fastifyAdapter.register(fastifyMultipart)

  const app = result.createNestApplication<NestFastifyApplication>(
    fastifyAdapter
  )

  // TODO: Lock to specific origins
  app.enableCors({
    origin: '*'
  })

  app.useGlobalPipes(new ValidationPipe())
  app.useGlobalGuards(
    new UploadGuard(app.get(Reflector)),
    new JwtAuthGuard(app.get(Reflector)),
    new IamGuard(app.get(Reflector))
  )

  await app.init()
  await app.getHttpAdapter().getInstance().ready()

  return app
}
