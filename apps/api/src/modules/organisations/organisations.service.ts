import { Injectable } from '@nestjs/common'
import { Repository } from 'typeorm'
import { CreateOrganisationDto } from './dto/create-organisation.dto'
import { UpdateOrganisationDto } from './dto/update-organisation.dto'
import { Organisation } from './entities/organisation.entity'
import { Image } from '../images/entities/image.entity'
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
    const { email, invitee, imageId, ...rest } = createOrganisationDto

    let create: Partial<Organisation> = { ...rest }

    if (imageId) {
      create.avatar = new Image()
      create.avatar.id = imageId
    }

    const organisation = await this.organisationRepository.save(
      this.organisationRepository.create(create)
    )

    // Optionally invite a user by email
    let invitation: OrganisationsInvitation
    let inviteLink: string

    if (email) {
      const result = await this.invitationsService.create(organisation.id, {
        email,
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
      skip: options.page * options.limit,
      relations: ['avatar']
    })

    return new Pagination<Organisation>({
      results,
      total
    })
  }

  findOne(id: string) {
    return this.organisationRepository.findOne(id)
  }

  update(id: string, { imageId, ...rest }: UpdateOrganisationDto) {
    let update: Partial<Organisation> = { ...rest }

    if (imageId) {
      update.avatar = new Image()
      update.avatar.id = imageId

      // Explict removal of image
    } else if (imageId === null) {
      update.avatar = null
    }

    return this.organisationRepository.update(id, update)
  }

  async remove(id: string) {
    const organisation = await this.organisationRepository.findOne(id, {
      relations: ['subscriptions', 'invitations']
    })

    const result = await getManager().transaction(async (entityManager) => {
      // TODO delete teams, subscriptions, leagues, activities, etc.

      // Delete invitations
      if (organisation.invitations.length) {
        await entityManager.delete(
          OrganisationsInvitation,
          organisation.invitations.map((entity) => entity.id)
        )
      }

      // Finally, delete the organisation
      return await entityManager.delete(Organisation, organisation.id)
    })

    return result
  }
}
