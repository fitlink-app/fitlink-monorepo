import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { LeaderboardEntriesModule } from './leaderboard-entries/leaderboard-entries.module'
import { LeaderboardEntry } from './leaderboard-entries/entities/leaderboard-entry.entity'
import { ConfigModule, ConfigService } from '@nestjs/config'

@Module({
  imports: [
    ConfigModule.forRoot(),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          type: 'postgres',
          database: configService.get('DB_NAME'),
          password: configService.get('DB_PASSWORD'),
          username: configService.get('DB_USERNAME'),
          host: configService.get('DB_HOST'),
          port: configService.get('DB_PORT'),
          dropSchema: false,
          entities: [LeaderboardEntry],
          synchronize: false,
          logging: false,
          retryAttempts: 1,
          migrationsRun: configService.get('MIGRATIONS_RUN')
        }
      }
    }),
    LeaderboardEntriesModule
  ]
})
export class ApiModule {}
