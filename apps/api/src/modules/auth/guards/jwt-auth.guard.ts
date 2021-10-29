import {
  Injectable,
  ExecutionContext,
  UnauthorizedException
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AuthGuard } from '@nestjs/passport'
import { IS_PUBLIC_KEY } from '../../../decorators/public.decorator'
import { JsonWebTokenError } from 'jsonwebtoken'
import { ERR_TOKEN_EXPIRED } from '../../../constants/errors'

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super()
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass()
    ])
    if (isPublic) {
      return true
    }
    return super.canActivate(context)
  }

  handleRequest(err: any, user: any, info: any, context: any, status: any) {
    if (info instanceof JsonWebTokenError) {
      throw new UnauthorizedException(ERR_TOKEN_EXPIRED)
    }

    return super.handleRequest(err, user, info, context, status)
  }
}
