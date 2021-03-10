import { Injectable } from '@nestjs/common'
import { CreateHealthActivityDto } from './dto/create-health-activity.dto'
import { UpdateHealthActivityDto } from './dto/update-health-activity.dto'

@Injectable()
export class HealthActivitiesService {
  create(createHealthActivityDto: CreateHealthActivityDto) {
    return 'This action adds a new healthActivity'
  }

  findAll() {
    return `This action returns all healthActivities`
  }

  findOne(id: number) {
    return `This action returns a #${id} healthActivity`
  }

  update(id: number, updateHealthActivityDto: UpdateHealthActivityDto) {
    return `This action updates a #${id} healthActivity`
  }

  remove(id: number) {
    return `This action removes a #${id} healthActivity`
  }
}
