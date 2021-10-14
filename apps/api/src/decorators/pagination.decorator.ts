import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export const Pagination = createParamDecorator(
  (data, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest()
    return {
      limit: Number(request.query.limit) || 10,
      page: Number(request.query.page) || 0
    }
  }
)
