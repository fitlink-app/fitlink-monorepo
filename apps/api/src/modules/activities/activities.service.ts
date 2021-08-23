import { In, Not, Repository, Brackets } from 'typeorm'
import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { CreateActivityDto } from './dto/create-activity.dto'
import { UpdateActivityDto } from './dto/update-activity.dto'
import { Pagination, PaginationOptionsInterface } from '../../helpers/paginate'
import { Activity, ActivityForMap } from './entities/activity.entity'
import { ActivityType } from './activities.constants'
import { Image } from '../images/entities/image.entity'
import { plainToClass } from 'class-transformer'
import { User } from '../users/entities/user.entity'

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
  async create(userId: string, createActivityDto: CreateActivityDto) {
    const {
      meeting_point,
      images,
      organizer_image,
      ...rest
    } = createActivityDto

    // Images are already uploaded and provided as array of strings
    let imageEntities: Image[] = []
    let organizerImage: Image
    if (images) {
      imageEntities = images.split(',').map((id) => {
        const image = new Image()
        image.id = id
        return image
      })
    }

    if (organizer_image) {
      const image = new Image()
      image.id = organizer_image
      organizerImage = image
    }

    let owner: User
    if (userId) {
      owner = new User()
      owner.id = userId
    }

    const activity = await this.activityRepository.save(
      this.activityRepository.create({
        ...rest,
        owner,
        organizer_image: organizerImage,
        meeting_point: {
          type: 'Point',
          coordinates: meeting_point.split(',')
        } as any
      })
    )

    if (imageEntities.length) {
      await this.activityRepository
        .createQueryBuilder()
        .relation(Image, 'activity')
        .of(imageEntities)
        .set(activity)

      // Store the images on the object for the response
      activity.images = imageEntities
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
    userId: string,
    { limit, page }: PaginationOptionsInterface
  ): Promise<Pagination<Activity>> {
    const [results, total] = await this.activityRepository.findAndCount({
      where: { owner: { id: userId } },
      take: limit,
      skip: page * limit,
      order: { created_at: 'DESC' },
      relations: ['organizer_image', 'images']
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
  async findAllMarkers(
    userId: string,
    geoRadial: string,
    type: string,
    keyword: string
  ) {
    const geo = geoRadial.split(',')
    const query = this.queryFindAccessibleToUser(userId)
      .andWhere(
        'ST_DistanceSphere(activity.meeting_point, ST_MakePoint(:lat,:lng)) <= :rad * 1000',
        {
          lat: geo[0],
          lng: geo[1],
          rad: parseInt(geo[2]) || 5
        }
      )
      .take(500)

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

    const results = await query.getMany()

    return new Pagination<ActivityForMap>({
      results: plainToClass(ActivityForMap, results, {
        excludeExtraneousValues: true
      }),
      total: results.length
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
    userId: string,
    geoRadial: string,
    type: string,
    keyword: string,
    options: PaginationOptionsInterface
  ): Promise<Pagination<Activity>> {
    let query = this.queryFindAccessibleToUser(userId)
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

  findOne(id: string, userId?: string) {
    if (userId) {
      return this.queryFindAccessibleToUser(userId)
        .andWhere('activity.id = :id', { id })
        .getOne()
    }
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
    const {
      meeting_point,
      images,
      organizer_image,
      ...rest
    } = updateActivityDto
    const updateData: Partial<Activity> = {
      ...rest
    }

    if (meeting_point) {
      updateData.meeting_point = {
        type: 'Point',
        coordinates: meeting_point.split(',') as any
      }
    }

    // Images are already uploaded and provided as array of strings
    let imageEntities: Image[] = []
    let organizerImage: Image
    if (images) {
      imageEntities = images.split(',').map((id) => {
        const image = new Image()
        image.id = id
        return image
      })
    }

    if (organizer_image) {
      const image = new Image()
      image.id = organizer_image
      organizerImage = image
    }

    // Explicitly remove organizer image
    if (organizer_image === null) {
      organizerImage = null
    }

    const activity = await this.activityRepository.save({
      ...updateData,
      id,
      organizer_image: organizerImage
    })

    if (imageEntities.length) {
      await this.activityRepository.manager.transaction(async (manager) => {
        // Remove any images that aren't being used for update
        await manager.getRepository(Image).delete({
          activity: { id: activity.id },
          id: Not(In(imageEntities.map((e) => e.id)))
        })

        await manager
          .getRepository(Activity)
          .createQueryBuilder()
          .relation(Image, 'activity')
          .of(imageEntities)
          .set(activity)
      })

      // If images was explicitly blank, delete all images
    } else if (images === '') {
      await this.imageRepository.delete({
        activity: { id: activity.id }
      })
    }

    return this.findOne(id)
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

  /**
   * Deletes activity images based on field name
   * @param id
   * @returns
   */
  async removeImages(id: string, field: 'images' | 'organizer_image') {
    const activity = await this.activityRepository.findOne({
      where: { id },
      relations: ['images', 'organizer_image']
    })

    let imageIds: string[] = []
    if (field === 'images' && activity.images.length) {
      imageIds = activity.images.map((each) => each.id)
    }

    if (field === 'organizer_image' && activity.organizer_image) {
      imageIds.push(activity.organizer_image.id)
      await this.activityRepository.update(id, {
        organizer_image: null
      })
    }

    return this.imageRepository
      .createQueryBuilder()
      .where('activityId = :id', { id })
      .andWhere('id IN(:...imageIds)', { imageIds })
      .delete()
      .execute()
  }

  getTypesFromString(type: string) {
    return type.split(',').map((each) => {
      if (!Object.values(ActivityType).includes(each as ActivityType)) {
        throw new BadRequestException(`Activity type ${each} does not exist`)
      }
      return each
    })
  }

  queryFindAccessibleToUser(userId: string) {
    return this.activityRepository
      .createQueryBuilder('activity')
      .leftJoinAndSelect('activity.images', 'images')
      .leftJoinAndSelect('activity.owner', 'owner')
      .leftJoin('user', 'user', 'user.id = :userId', { userId })
      .leftJoin('user.teams', 'team')
      .leftJoin('team.organisation', 'organisation')
      .leftJoinAndSelect('activity.organizer_image', 'organizer_image')
      .where(
        new Brackets((qb) => {
          // The league is public
          return (
            qb

              // The user owns the activity
              .where(`(owner.id = :userId)`)

              // The user belongs to the team that the activity belongs to
              .orWhere(`(activity.teamId = team.id)`)

              // The user belongs to the organisation that the league belongs to
              .orWhere(`(activity.organisationId = organisation.id)`)

              // The activity belongs to neither
              .orWhere(
                `(activity.organisationId IS NULL AND activity.teamId IS NULL)`
              )
          )
        }),
        {
          userId
        }
      )
  }
}
