import { Injectable } from '@nestjs/common'
import { Repository } from 'typeorm'
import { CreateOrganisationDto } from './dto/create-organisation.dto'
import { UpdateOrganisationDto } from './dto/update-organisation.dto'
import { Organisation } from './entities/organisation.entity'
import { Pagination, PaginationOptionsInterface } from '../../helpers/paginate'
import { OrganisationsInvitationsService } from '../organisations-invitations/organisations-invitations.service'
import { OrganisationsInvitation } from '../organisations-invitations/entities/organisations-invitation.entity'
import { getManager } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'

@Injectable()
export class OrganisationsService {
  constructor(
    @InjectRepository(Organisation)
    private readonly organisationRepository: Repository<Organisation>,
    private readonly invitationsService: OrganisationsInvitationsService
  ) {}

  async create(createOrganisationDto: CreateOrganisationDto) {
    const { email, invitee, ...rest } = createOrganisationDto
    const organisation = await this.organisationRepository.save(
      this.organisationRepository.create(rest)
    )

    // Optionally invite a user by email
    let invitation: OrganisationsInvitation
    let inviteLink: string

    if (email) {
      const result = await this.invitationsService.create({
        email,
        organisation,
        invitee
      })
      invitation = result.invitation
      inviteLink = result.inviteLink
    }

    return {
      organisation,
      invitation,
      inviteLink
    }
  }

  async findAll(
    options: PaginationOptionsInterface
  ): Promise<Pagination<Organisation>> {
    const [results, total] = await this.organisationRepository.findAndCount({
      order: { created_at: 'DESC' },
      take: options.limit,
      skip: options.page * options.limit
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

  async remove(id: string) {
    const organisation = await this.organisationRepository.findOne(id, {
      relations: ['subscriptions', 'invitations']
    })

    const result = await getManager().transaction(async (entityManager) => {

      // Delete invitations
      await entityManager.delete(
        OrganisationsInvitation,
        organisation.invitations.map((entity) => entity.id)
      )

      // Finally, delete the organisation
      return await entityManager.delete(Organisation, organisation.id)
    })

    return result
  }
}
