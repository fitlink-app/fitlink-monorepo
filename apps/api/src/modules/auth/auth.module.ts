import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthService } from './auth.service'
import { LocalStrategy } from './strategy/local'
import { JwtStrategy } from './jwt.strategy'
import { UsersModule } from '../users/users.module'
import { PassportModule } from '@nestjs/passport'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { UsersService } from '../users/users.service'
import { AuthController } from './auth.controller'
import { RefreshToken } from './entities/auth.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([RefreshToken]),
    ConfigModule,
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          secret: configService.get('AUTH_JWT_SECRET'),
          signOptions: { expiresIn: '1h' }
        }
      }
    })
  ],
  controllers: [AuthController],
  providers: [AuthService, UsersService, LocalStrategy, JwtStrategy],
  exports: [TypeOrmModule.forFeature([RefreshToken]), AuthService, UsersService]
})
export class AuthModule {}
