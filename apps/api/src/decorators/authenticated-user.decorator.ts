import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { AuthenticatedUser } from '../models'

export const User = createParamDecorator((data, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest()
  const user = request.user as AuthenticatedUser
  return user
})
