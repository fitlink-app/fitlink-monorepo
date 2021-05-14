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

    if (!isMultipart) {
      if (required) {
        throw new BadRequestException('multipart/form-data expected.')
      } else {
        return true
      }
    }

    const files = req.files()
    if (!files) {
      if (required) {
        throw new BadRequestException('File(s) expected')
      } else {
        return true
      }
    }

    // Check for array-like field names
    filenames = filenames.concat(
      filenames.map((fieldName) => {
        return `${fieldName}[]`
      })
    )

    let body = (req.body as NodeJS.Dict<string>) || {}
    req.incomingFiles = req.incomingFiles || []

    // Async iteratorable of files
    for await (const file of files) {
      checkFileName(file, filenames)
      await consumeAndCheckFileSize(file)
      req.incomingFiles.push(file)
      body = getBodyFromFile(file, body)
    }

    req.body = body

    return true
  }
}

/**
 * Checks the file matches expected file names
 *
 * @param file
 * @param filenames
 */
function checkFileName(file, filenames) {
  if (
    !filenames.includes(file.fieldname) &&
    !filenames.includes(`${file.fieldname}[]`) &&
    !filenames.includes(`${file.fieldname}[0]`)
  ) {
    throw new BadRequestException('Unexpected file')
  }
}

/**
 * Buffer mustbe consumed for async iteratorable to
 * work correctly (or it hangs indefinitely)
 *
 * @param file
 */
async function consumeAndCheckFileSize(file) {
  const buffer = await file.toBuffer()

  // 10mb file limit
  if (buffer.byteLength > 1024 * 1024 * 10) {
    throw new BadRequestException('File too large')
  }

  return buffer
}

/**
 * Gets the request body (payload)
 * from the file
 *
 * @param file
 * @returns
 */
function getBodyFromFile(file, body: NodeJS.Dict<string>) {
  // Restore request body of remaining (text) fields
  Object.keys(file.fields).map((key) => {
    const each = file.fields[key] as any
    if (each[0] && each[0].file) {
      return true
    }

    if (each[0] && !each[0].file) {
      body[key] = each[0].value
    }

    if (!each.file && each.value !== undefined) {
      body[key] = each.value
    }
  })
  return body
}
