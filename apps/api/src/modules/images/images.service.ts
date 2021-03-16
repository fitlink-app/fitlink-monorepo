import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { Injectable } from '@nestjs/common'
// import { CreateImageDto } from './dto/create-image.dto'
import { UpdateImageDto } from './dto/update-image.dto'
import { Image, ImageType, uploadVariants } from './entities/image.entity'
import {
  S3Client,
  PutObjectCommand,
  PutObjectCommandInput
} from '@aws-sdk/client-s3'
import { ConfigService } from '@nestjs/config'
import { resizeFromBuffer } from './helpers/resize'
import { v4 as uuidv4 } from 'uuid'

@Injectable()
export class ImagesService {
  constructor(
    @InjectRepository(Image)
    private imageRepository: Repository<Image>,
    private configService: ConfigService
  ) {}

  async create(file: Buffer, imageType = ImageType.Standard) {
    const fileName = uuidv4()
    const image = await this.generateVariants(file, fileName, imageType)
    return await this.imageRepository.save(this.imageRepository.create([image]))
  }

  async upload(file: Buffer, filePath: string) {
    const client = new S3Client({
      credentials: {
        accessKeyId: this.configService.get('S3_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get('S3_SECRET_ACCESS_KEY')
      },
      region: this.configService.get('S3_REGION'),
      endpoint: this.configService.get('S3_ENDPOINT'),
      forcePathStyle: true
    })

    const input: PutObjectCommandInput = {
      Bucket: this.configService.get('S3_BUCKET'),
      Body: file,
      ContentLength: Buffer.byteLength(file),
      ContentType: 'image/jpeg',
      ContentDisposition: 'inline',
      Key: filePath,
      ACL: 'public-read'
    }

    await client.send(new PutObjectCommand(input))

    return [
      this.configService.get('S3_ENDPOINT'),
      this.configService.get('S3_BUCKET'),
      filePath
    ].join('/')
  }

  async generateVariants(
    file: Buffer,
    fileName: string,
    imageType: ImageType
  ): Promise<Partial<Image>> {
    const variants = await Promise.all(
      uploadVariants.map(async (variant) => {
        const { size, fit, type, column } = variant
        const buffer = await resizeFromBuffer(
          file,
          size as [number, number],
          fit
        )
        const name = `${fileName}-${type}.jpg`
        const url = await this.upload(buffer, name)
        const dimensions =
          column === 'url'
            ? {
                width: size[0],
                height: size[1]
              }
            : null
        return {
          ...dimensions,
          [column]: url
        }
      })
    )

    return variants.reduce((prev, current) => {
      return {
        ...prev,
        ...current,
        type: imageType
      }
    }, {})
  }

  findAll() {
    return `This action returns all images`
  }

  findOne(id: number) {
    return `This action returns a #${id} image`
  }

  update(id: number, updateImageDto: UpdateImageDto) {
    return `This action updates a #${id} image`
  }

  remove(id: number) {
    return `This action removes a #${id} image`
  }
}
