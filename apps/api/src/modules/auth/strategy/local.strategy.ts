import { Strategy } from 'passport-local'
import { PassportStrategy } from '@nestjs/passport'
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { AuthService } from '../auth.service'
import { isEmail } from 'class-validator'
import { User } from '../../users/entities/user.entity'

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
      passwordField: 'password'
    })
  }

  async validate(email: string, password: string): Promise<any> {
    let user: User | false
    if (isEmail(email)) {
      user = await this.authService.validateAndRetrieveUser(email, password)
    }
    if (!user) {
      throw new UnauthorizedException('Invalid email or password')
    }
    return user
  }
}
