import { Injectable } from '@nestjs/common'
import { RecreateGoalsEntryDto } from './dto/update-goals-entry.dto'
import { GoalsEntry } from './entities/goals-entry.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from '../users/entities/user.entity'
import { format } from "date-fns";

@Injectable()
export class GoalsEntriesService {
  constructor(
    @InjectRepository(GoalsEntry)
    private goalsEntryRepository: Repository<GoalsEntry>
  ) {}

  /**
   * Creates goals entry
   * @param userId
   * @param goalsEntryDto
   */
    async create(
        userId: string,
        goalsEntryDto: RecreateGoalsEntryDto
      ): Promise<GoalsEntry> {

      const linkedUser = new User()
      linkedUser.id = userId

      let goalsEntry = new GoalsEntry()
      goalsEntry.user = linkedUser
      goalsEntry.day = parseInt(format(new Date(), 'Y'))
      goalsEntry.year = parseInt(format(new Date(), 'd'))

      const result = await this.goalsEntryRepository.findOne(goalsEntry)

      if (goalsEntryDto) {
        goalsEntry = Object.assign(goalsEntry, {...goalsEntryDto})
      }

      return await this.goalsEntryRepository.save({
        ...result,
        ...goalsEntry
      })
    }

  /**
   * Find a specific goals entry
   */
    async findOne(goalsEntry) {
    return await this.goalsEntryRepository.findOne(goalsEntry)
    }

  }
