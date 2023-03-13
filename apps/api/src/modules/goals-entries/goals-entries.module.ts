import { forwardRef, HttpModule, Module } from '@nestjs/common'
import { GoalsEntriesService } from './goals-entries.service'
import { GoalsEntriesController } from './goals-entries.controller'
import { AuthModule } from '../auth/auth.module'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { GoalsEntry } from './entities/goals-entry.entity'
import { UsersModule } from '../users/users.module'
import { FeedItemsModule } from '../feed-items/feed-items.module'
import { User } from '../users/entities/user.entity'
import { DailyGoalReachedListener } from './listeners/DailyGoalsReachedListener'
import { CommonModule } from '../common/common.module'
import { NotificationsModule } from '../notifications/notifications.module'
import { League } from '../leagues/entities/league.entity'
import { LeagueBfitEarnings } from '../leagues/entities/bfit-earnings.entity'
import { WalletTransaction } from '../wallet-transactions/entities/wallet-transaction.entity'
import { LeaderboardEntry } from '../leaderboard-entries/entities/leaderboard-entry.entity'
import { LeaguesService } from '../leagues/leagues.service'
import { Leaderboard } from '../leaderboards/entities/leaderboard.entity'
import { LeagueBfitClaim } from '../leagues/entities/bfit-claim.entity'
import { Organisation } from '../organisations/entities/organisation.entity'
import { LeaguesInvitation } from '../leagues-invitations/entities/leagues-invitation.entity'
import { LeaderboardEntriesService } from '../leaderboard-entries/leaderboard-entries.service'
import { SqsOptions } from '@ssut/nestjs-sqs/dist/sqs.types'
import * as AWS from 'aws-sdk';
import { SqsModule } from '@ssut/nestjs-sqs'
import { QUEUE_NAME } from '../bfit/bfit.constant'
import { BfitDistributionProducerModule } from '../bfit/bfit-producer.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      GoalsEntry,
      User,
      League,
      LeagueBfitEarnings,
      WalletTransaction,
      LeaderboardEntry,
      Leaderboard,
      LeagueBfitClaim,
      Organisation,
      LeaguesInvitation
    ]),
    forwardRef(() => UsersModule),
    forwardRef(() => AuthModule),
    forwardRef(() => FeedItemsModule),
    BfitDistributionProducerModule,
    ConfigModule,
    HttpModule,
    CommonModule,
    NotificationsModule,
    SqsModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          producers: [
            {
              queueUrl: configService.get('SQS_QUEUE_URL'),
              region: configService.get('SQS_REGION'),
              name: QUEUE_NAME,
              sqs: new AWS.SQS({
                accessKeyId: configService.get('SQS_ACCESS_KEY_ID'),
                secretAccessKey: configService.get('SQS_SECRET_ACCESS_KEY'),
                region: configService.get('SQS_REGION'),
              }),
            }
          ]
        } as SqsOptions;
      }
    }),
  ],
  controllers: [GoalsEntriesController],
  providers: [
    GoalsEntriesService,
    LeaguesService,
    LeaderboardEntriesService,
    DailyGoalReachedListener
  ],
  exports: [TypeOrmModule.forFeature([GoalsEntry]), GoalsEntriesService]
})
export class GoalsEntriesModule {}
