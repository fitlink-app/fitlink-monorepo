import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { FastifyRequest } from 'fastify'

@Injectable()
export class UploadGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const reflectUploads = this.reflector.get<{
      required: boolean
      filenames: string[]
    }>('uploads', context.getHandler())
    if (!reflectUploads) {
      return true
    }

    let { filenames } = reflectUploads
    const { required } = reflectUploads

    const req = context.switchToHttp().getRequest() as FastifyRequest
    const isMultipart = req.isMultipart()

    if (!isMultipart && required) {
      throw new BadRequestException('multipart/form-data expected.')
    } else if (!required) {
      return true
    }

    const files = req.files()

    if (!files && required) {
      throw new BadRequestException('File(s) expected')
    } else if (!required) {
      return true
    }

    // Check for array-like field names
    filenames = filenames.concat(
      filenames.map((fieldName) => {
        return `${fieldName}[]`
      })
    )

    req.incomingFiles = []
    const body = {}
    for await (const file of files) {
      if (
        !filenames.includes(file.fieldname) ||
        filenames.includes(`${file.fieldname}[]`)
      ) {
        throw new BadRequestException('Unexpected file')
      }

      const buffer = await file.toBuffer()

      // 10mb file limit
      if (buffer.byteLength > 1024 * 1024 * 10) {
        throw new BadRequestException('File too large')
      }

      req.incomingFiles.push(file)

      // Restore request body of remaining (text) fields
      Object.keys(file.fields).map((key) => {
        const each = file.fields[key] as any
        if (each[0] && each[0].file) {
          return true
        }

        if (!each.file) {
          body[key] = each.value
        }
      })
    }

    req.body = body

    return true
  }
}
