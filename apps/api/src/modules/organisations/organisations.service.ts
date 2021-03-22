import { Inject, Injectable } from '@nestjs/common'
import { Repository } from 'typeorm'
import { CreateOrganisationDto } from './dto/create-organisation.dto'
import { UpdateOrganisationDto } from './dto/update-organisation.dto'
import { Organisation } from './entities/organisation.entity'
import { Pagination, PaginationOptionsInterface } from '../../helpers/paginate'
import { InjectRepository } from '@nestjs/typeorm'
import { SubscriptionsService } from '../subscriptions/subscriptions.service'

@Injectable()
export class OrganisationsService {
  constructor(
    @InjectRepository(Organisation)
    private readonly organisationRepository: Repository<Organisation>,
    @Inject(SubscriptionsService)
    private readonly subscriptionService: SubscriptionsService
  ) {}

  async create(createOrganisationDto: CreateOrganisationDto) {
    const organisation = await this.organisationRepository.save(
      this.organisationRepository.create(createOrganisationDto)
    )
    return organisation
  }

  async findAll(
    options: PaginationOptionsInterface
  ): Promise<Pagination<Organisation>> {
    const [results, total] = await this.organisationRepository.findAndCount({
      order: { created_at: 'DESC' },
      take: options.limit,
      skip: options.page
    })

    return new Pagination<Organisation>({
      results,
      total
    })
  }

  findOne(id: string) {
    return this.organisationRepository.findOne(id)
  }

  update(id: string, updateOrganisationDto: UpdateOrganisationDto) {
    return this.organisationRepository.update(id, updateOrganisationDto)
  }

  remove(id: string) {
    return this.organisationRepository.delete(id)
  }
}
