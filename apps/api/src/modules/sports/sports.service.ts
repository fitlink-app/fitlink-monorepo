import {
  BadRequestException,
  Injectable,
  NotFoundException
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Pagination, PaginationOptionsInterface } from '../../helpers/paginate'
import { CreateSportDto } from './dto/create-sport.dto'
import { UpdateSportDto } from './dto/update-sport.dto'
import { Sport } from './entities/sport.entity'

@Injectable()
export class SportsService {
  constructor(
    @InjectRepository(Sport)
    private sportsRepository: Repository<Sport>
  ) {}

  async create(createSportDto: CreateSportDto): Promise<Sport> {
    const { name, name_key, plural, singular } = createSportDto

    const newSport = {
      name,
      name_key,
      plural,
      singular,
      created_at: new Date(),
      updated_at: new Date()
    } as Sport
    try {
      return await this.sportsRepository.save(newSport)
    } catch (e) {
      throw new BadRequestException()
    }
  }

  async findAll(
    options: PaginationOptionsInterface
  ): Promise<Pagination<Sport>> {
    const [results, total] = await this.sportsRepository.findAndCount()

    return new Pagination<Sport>({
      results,
      total
    })
  }

  async findOne(id: string): Promise<Sport> {
    try {
      return await this.sportsRepository.findOne({ where: { id } })
    } catch (e) {
      throw new NotFoundException()
    }
  }

  async update(id: string, updateSportDto: UpdateSportDto) {
    try {
      return await this.sportsRepository.update(id, updateSportDto)
    } catch (e) {
      throw new BadRequestException()
    }
  }

  async remove(id: string) {
    try {
      return await this.sportsRepository.delete(id)
    } catch (e) {
      throw new NotFoundException()
    }
  }
}
