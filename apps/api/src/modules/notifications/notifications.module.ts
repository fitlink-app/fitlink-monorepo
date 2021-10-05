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
        const credential = admin.credential.cert(
          JSON.parse(
            Buffer.from(
              configService.get<string>('FIREBASE_ADMIN_CREDENTIAL'),
              'base64'
            ).toString('utf8') //admin.credential.applicationDefault()
          )
        )

        return { credential }
      }
    })
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService]
})
export class NotificationsModule {}
