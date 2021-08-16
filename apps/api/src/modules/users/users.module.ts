import { forwardRef, HttpModule, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UsersService } from './users.service'
import { UsersController } from './users.controller'
import { User } from './entities/user.entity'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { UsersInvitationsModule } from '../users-invitations/users-invitations.module'
import { UserRolesModule } from '../user-roles/user-roles.module'
import { JwtModule } from '@nestjs/jwt'
import { CommonModule } from '../common/common.module'
import { AuthProvider } from '../auth/entities/auth-provider.entity'
import { UserPointsIncrementedListener } from './listeners/UserPointsIncrementedListener'
import { RewardsModule } from '../rewards/rewards.module'
import { FeedItemsModule } from '../feed-items/feed-items.module'

@Module({
  imports: [
    CommonModule,
    TypeOrmModule.forFeature([User, AuthProvider]),
    ConfigModule,
    FeedItemsModule,
    HttpModule,
    // forward ref rewards module because of the circular dependency
    forwardRef(() => RewardsModule),
    UserRolesModule,
    UsersInvitationsModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          secret: configService.get('EMAIL_JWT_TOKEN_SECRET'),
          signOptions: { expiresIn: '1h' }
        }
      }
    })
  ],
  controllers: [UsersController],
  providers: [UsersService, ConfigService, UserPointsIncrementedListener],
  exports: [TypeOrmModule.forFeature([User]), UsersService]
})
export class UsersModule {}
