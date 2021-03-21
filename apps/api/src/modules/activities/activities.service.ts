import { Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { CreateActivityDto } from './dto/create-activity.dto'
import { UpdateActivityDto } from './dto/update-activity.dto'
import { Pagination, PaginationOptionsInterface } from '../../helpers/paginate'
import { Activity } from './entities/activity.entity'
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
   * Find all entries by geometry
   * @param geo lat, lon, radius in km (comma separated)
   * @param options { page, limit }
   */
  async findAll(
    geoRadial: string,
    options: PaginationOptionsInterface
  ): Promise<Pagination<Activity>> {
    const geo = geoRadial.split(',')
    const [results, total] = await this.activityRepository
      .createQueryBuilder('activity')
      .where(
        'ST_DistanceSphere(activity.meeting_point, ST_MakePoint(:lon,:lat)) <= :rad * 1000',
        {
          lat: geo[0],
          lon: geo[1],
          rad: 5 // 1km
        }
      )
      .take(options.limit)
      .skip(options.page * options.limit)
      .getManyAndCount()

    return new Pagination<Activity>({
      results,
      total
    })
  }

  findOne(id: string) {
    return this.activityRepository.findOne(id)
  }

  update(id: string, updateActivityDto: UpdateActivityDto) {
    return this.activityRepository.update({ id }, updateActivityDto)
  }

  remove(id: string) {
    return this.activityRepository.delete({ id })
  }
}
