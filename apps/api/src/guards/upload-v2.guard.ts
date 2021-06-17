import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { FastifyRequest } from 'fastify'
import { FileUploadOptions } from '../decorators/uploads.decorator'
import sharp = require('sharp')

@Injectable()
export class UploadGuardV2 implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const uploadOptions = this.reflector.get<FileUploadOptions>(
      'upload',
      context.getHandler()
    )
    if (!uploadOptions) {
      return true
    }

    const req = context.switchToHttp().getRequest() as FastifyRequest
    const isMultipart = req.isMultipart()

    if (!isMultipart) {
      throw new BadRequestException('multipart/form-data expected.')
    }

    const file = await req.file()
    if (!file) {
      throw new BadRequestException('File(s) expected')
    }

    let body = (req.body as NodeJS.Dict<string>) || {}

    await consumeAndCheckFileSizeAndMimeType(file, uploadOptions)

    req.incomingFile = file
    req.body = getBodyFromFile(file, body)

    return true
  }
}

/**
 * Ensures file size is not above limit
 *
 * @param file
 */
async function consumeAndCheckFileSizeAndMimeType(
  file: Storage.MultipartFile,
  options: FileUploadOptions
) {
  const buffer = await file.toBuffer()

  // 10mb file limit
  if (buffer.byteLength > 1024 * 1024 * options.maxFileSize) {
    throw new BadRequestException('File too large')
  }

  // Mime type can be passed as application/octet-stream
  // In this case, it needs to be processed by Sharp to verify it's an image
  if (options.fileType === 'image') {
    try {
      await sharp(buffer).stats()
    } catch (e) {
      throw new BadRequestException(e)
    }
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
function getBodyFromFile(
  file: Storage.MultipartFile,
  body: NodeJS.Dict<string>
) {
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
