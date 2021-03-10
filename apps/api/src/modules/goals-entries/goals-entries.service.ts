import { Injectable } from '@nestjs/common'
import { CreateGoalsEntryDto } from './dto/create-goals-entry.dto'
import { UpdateGoalsEntryDto } from './dto/update-goals-entry.dto'

@Injectable()
export class GoalsEntriesService {
  create(createGoalsEntryDto: CreateGoalsEntryDto) {
    return 'This action adds a new goalsEntry'
  }

  findAll() {
    return `This action returns all goalsEntries`
  }

  findOne(id: number) {
    return `This action returns a #${id} goalsEntry`
  }

  update(id: number, updateGoalsEntryDto: UpdateGoalsEntryDto) {
    return `This action updates a #${id} goalsEntry`
  }

  remove(id: number) {
    return `This action removes a #${id} goalsEntry`
  }
}
