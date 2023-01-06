import { forwardRef, HttpModule, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from '../auth/auth.module'
import { UsersModule } from '../users/users.module'
import { Notification } from './entities/notification.entity'
import { FirebaseAdminCoreModule } from './firebase-admin.module'
import { NotificationsController } from './notifications.controller'
import { NotificationsService } from './notifications.service'
import * as admin from 'firebase-admin'
import { ConfigModule, ConfigService } from '@nestjs/config'

@Module({
  imports: [
    forwardRef(() => TypeOrmModule.forFeature([Notification])),
    forwardRef(() => UsersModule),
    forwardRef(() => AuthModule),
    FirebaseAdminCoreModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const configCredential = configService.get<string>(
          'FIREBASE_ADMIN_CREDENTIAL'
        )

        if (process.env.MIGRATION === 'firebase') {
          return { credential: {} as admin.credential.Credential }
        }

        /* const credential = admin.credential.cert(
          JSON.parse(
            Buffer.from(
              configCredential
                ? configCredential
                : // As a work around for Lambda configuration size limits,
                  // we need to replace this secret during the deploy process
                  // on Github actions using sed 's/word1/word2/g'
                  '{GITHUB_REPLACE_FIREBASE_ADMIN_CREDENTIAL}',
              'base64'
            ).toString('utf8')
          )
        ) */

        return { }
      }
    })
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService]
})
export class NotificationsModule {}
