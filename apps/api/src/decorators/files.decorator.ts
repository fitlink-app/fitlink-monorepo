import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException
} from '@nestjs/common'
import { FastifyRequest } from 'fastify'
export const Files = createParamDecorator(
  (name: string, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest() as FastifyRequest
    const files = req.incomingFiles || []
    const results = files.filter((file) => file.fieldname === name)

    if (!name) {
      throw new InternalServerErrorException(
        'The field name must be supplied in the file decorator'
      )
    }

    // If the name is not using array syntax style
    // force return a single result only.
    if (name.indexOf('[]') === -1) {
      return results[0]
    }

    return results
  }
)
