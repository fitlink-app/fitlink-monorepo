import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt'
import { PassportStrategy } from '@nestjs/passport'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JWTAccessToken, AuthenticatedUser } from '../../../models'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('AUTH_JWT_SECRET')
    } as StrategyOptions)
  }

  async validate(payload: JWTAccessToken) {
    return {
      id: payload.sub,
      roles: {
        organisation_admin: payload.roles.o_a,
        subscription_admin: payload.roles.s_a,
        team_admin: payload.roles.t_a,
        super_admin: payload.roles.spr
      }
    } as AuthenticatedUser
  }
}
