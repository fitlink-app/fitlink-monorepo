import { Repository } from 'typeorm'
import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { CreateActivityDto } from './dto/create-activity.dto'
import { UpdateActivityDto } from './dto/update-activity.dto'
import { Pagination, PaginationOptionsInterface } from '../../helpers/paginate'
import { Activity, ActivityType } from './entities/activity.entity'
import { Image } from '../images/entities/image.entity'

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectRepository(Activity)
    private activityRepository: Repository<Activity>,
    @InjectRepository(Image)
    private imageRepository: Repository<Image>
  ) {}

  /**
   * Creates an activity along with associated images
   * @param createActivityDto
   * @returns
   */
  async create(createActivityDto: CreateActivityDto) {
    const { meeting_point, images, ...rest } = createActivityDto
    const activity = await this.activityRepository.save(
      this.activityRepository.create({
        ...rest,
        images,
        meeting_point: {
          type: 'Point',
          coordinates: meeting_point.split(',')
        }
      })
    )

    if (images.length) {
      await this.activityRepository
        .createQueryBuilder()
        .relation(Image, 'activity')
        .of(images)
        .set(activity)
    }

    return activity
  }

  /**
   * Find all entries that were created by the particular user_id (legacy Firebase user)
   *
   * @param user_id string
   * @param options { page, limit }
   */
  async findUserActivities(
    user_id: string,
    { limit, page }: PaginationOptionsInterface
  ): Promise<Pagination<Activity>> {
    const [results, total] = await this.activityRepository.findAndCount({
      where: { user_id },
      take: limit,
      skip: page * limit
    })

    return new Pagination<Activity>({
      results,
      total
    })
  }

  /**
   * Find all entries by geometry, or alternatively
   * by date created
   *
   * @param geo lat, lon, radius in km (comma separated)
   * @param options { page, limit }
   */
  async findAll(
    geoRadial: string,
    type: string,
    keyword: string,
    options: PaginationOptionsInterface
  ): Promise<Pagination<Activity>> {
    let query = this.activityRepository
      .createQueryBuilder('activity')
      .leftJoinAndSelect('activity.organizer_image', 'organizer_image')
      .leftJoinAndSelect('activity.images', 'image')
      .take(options.limit)
      .skip(options.page * options.limit)

    if (geoRadial) {
      const geo = geoRadial.split(',')
      query = query.where(
        'ST_DistanceSphere(activity.meeting_point, ST_MakePoint(:lat,:lng)) <= :rad * 1000',
        {
          lat: geo[0],
          lng: geo[1],
          rad: parseInt(geo[2]) || 5
        }
      )
    } else {
      query = query.orderBy('activity.created_at', 'DESC')
    }

    // Query by 1 or more types
    if (type) {
      const types = this.getTypesFromString(type)
      const where = geoRadial ? 'andWhere' : 'where'
      query[where]('activity.type IN (:...types)', { types })
    }

    // Query by keyword in tsvector
    if (keyword) {
      const where = geoRadial || type ? 'andWhere' : 'where'
      query[where]('activity.tsv @@ plainto_tsquery(:keyword)', {
        keyword: keyword.toLowerCase()
      })
    }

    const [results, total] = await query.getManyAndCount()

    return new Pagination<Activity>({
      results,
      total
    })
  }

  findOne(id: string) {
    return this.activityRepository.findOne(id, {
      relations: ['organizer_image', 'images']
    })
  }

  findOneUserActivity(id: string, user_id: string) {
    return this.activityRepository.findOne({
      where: {
        id,
        user_id
      },
      relations: ['organizer_image', 'images']
    })
  }

  async update(id: string, updateActivityDto: UpdateActivityDto) {
    const { meeting_point } = updateActivityDto
    const updateData = updateActivityDto as any
    if (meeting_point) {
      updateData.meeting_point = {
        type: 'Point',
        coordinates: meeting_point.split(',')
      }
    }

    // Merge existing images with new images
    if (
      updateData.images &&
      updateData.images.length &&
      !updateData.__replaceImages
    ) {
      const activity = await this.findOne(id)
      const deleteImages = updateData.__deleteImages
        ? updateData.__deleteImages.split(',')
        : []
      updateData.images = [
        ...activity.images.filter((image) => {
          return !deleteImages.includes(image.id)
        }),
        ...updateData.images
      ]
    }

    return this.activityRepository.save({ id, ...updateData })
  }

  /**
   * Deletes activity images first
   * and then deletes activity
   * @param id
   * @returns
   */
  async remove(id: string) {
    await this.imageRepository
      .createQueryBuilder()
      .where('activityId = :id', { id })
      .delete()
      .execute()
    return this.activityRepository.delete({ id })
  }

  async removeUserActivity(id: string, user_id: string) {
    await this.imageRepository
      .createQueryBuilder()
      .where('activityId = :id', { id })
      .delete()
      .execute()

    return this.activityRepository.delete({
      id,
      user_id
    })
  }

  getTypesFromString(type: string) {
    return type.split(',').map((each) => {
      if (!Object.values(ActivityType).includes(each as ActivityType)) {
        throw new BadRequestException(`Activity type ${each} does not exist`)
      }
      return each
    })
  }
}
