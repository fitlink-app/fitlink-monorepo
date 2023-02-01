import { FindOneOptions, Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import {
  HttpService,
  Injectable,
  InternalServerErrorException
} from '@nestjs/common'
import { Image, uploadVariants } from './entities/image.entity'
import { ImageType } from './images.constants'
import {
  S3Client,
  PutObjectCommand,
  PutObjectCommandInput,
  S3ClientConfig
} from '@aws-sdk/client-s3'
import { ConfigService } from '@nestjs/config'
import { resizeFromBuffer } from './helpers/resize'
import { v4 as uuidv4 } from 'uuid'
import { Pagination, PaginationOptionsInterface } from '../../helpers/paginate'

@Injectable()
export class ImagesService {
  constructor(
    @InjectRepository(Image)
    private imageRepository: Repository<Image>,
    private configService: ConfigService,
    private httpService: HttpService
  ) {}

  async create(
    file: Buffer,
    imageType = ImageType.Standard,
    imageProperties?: Partial<Image>
  ) {
    const fileName = uuidv4()
    const image = await this.generateVariants(file, fileName, imageType)
    return await this.imageRepository.save(
      this.imageRepository.create([
        {
          ...image,
          ...imageProperties
        }
      ])
    )
  }

  async createOne(
    file: Storage.MultipartFile,
    imageType = ImageType.Standard,
    imageProperties?: Partial<Image>
  ) {
    const buffer = await file.toBuffer()
    const result = await this.create(buffer, imageType, imageProperties)
    return result[0]
  }

  async createOneFromUrl(
    url: string,
    imageType = ImageType.Standard,
    imageProperties?: Partial<Image>
  ) {
    const response = await this.httpService
      .get(url, { responseType: 'arraybuffer' })
      .toPromise()
    const result = await this.create(response.data, imageType, imageProperties)
    return result[0]
  }

  async createMany(
    files: Storage.MultipartFile[],
    imageType = ImageType.Standard,
    imageProperties?: Partial<Image>
  ) {
    return await Promise.all(
      files.map(async (each) => {
        const file = await each.toBuffer()
        const result = await this.create(file, imageType, imageProperties)
        return result[0]
      })
    )
  }

  async upload(file: Buffer, filePath: string) {
    const config: S3ClientConfig = {
      credentials: {
        accessKeyId: this.configService.get('S3_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get('S3_SECRET_ACCESS_KEY')
      },
      region: this.configService.get('S3_REGION'),
      endpoint: this.configService.get('S3_ENDPOINT'),
      forcePathStyle: this.configService.get('S3_USE_ACCESS_POINT') !== '1'
    }

    const client = new S3Client(config)

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

    return [this.configService.get('S3_BUCKET_PUBLIC_ENDPOINT'), filePath].join(
      '/'
    )
  }

  async generateVariants(
    file: Buffer,
    fileName: string,
    imageType: ImageType
  ): Promise<Partial<Image>> {
    const variants = await Promise.all(
      uploadVariants.map(async (variant) => {
        const { size, fit, type, column } = variant
        const { buffer, format } = await resizeFromBuffer(
          file,
          size as [number, number],
          fit
        )
        const name = `${fileName}-${type}.${format}`
        let url = ''
        try {
          url = await this.upload(buffer, name)
        } catch (e) {
          console.error(e)
          throw new InternalServerErrorException(
            'Cannot upload images at this time.'
          )
        }

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

  /**
   * Find all entries by leaderboard, with paginated options
   * @param leaderboardId
   * @param options
   */
  async findAll(
    where: FindOneOptions<Image>['where'],
    options: PaginationOptionsInterface
  ): Promise<Pagination<Image>> {
    const [results, total] = await this.imageRepository.findAndCount({
      where,
      take: options.limit,
      skip: options.page * options.limit
    })

    return new Pagination<Image>({
      results,
      total
    })
  }

  /**
   * Find a single image
   * @param id
   */
  findOne(id: string) {
    return this.imageRepository.findOne(id)
  }

  /**
   * Deletes an image (with soft delete)
   * @param id
   * @returns
   */
  remove(id: string) {
    return this.imageRepository.delete(id)
  }

  /**
   * Creates an image from an external trusted url,
   * e.g. one provided by Apple or Google (sign in)
   *
   * @param url
   * @param override
   * @returns Image
   */
  createProxy(url: string, override: Partial<Image>, imageId?: string) {
    const image = this.imageRepository.create({
      url: url,
      url_128x128: url,
      url_512x512: url,
      url_640x360: url,
      width: 0,
      height: 0,
      ...override
    })

    return this.imageRepository.save(image)
  }
}
