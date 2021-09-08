import { Injectable } from '@nestjs/common'
import { Brackets, ILike, Repository } from 'typeorm'
import { CreateOrganisationDto } from './dto/create-organisation.dto'
import { UpdateOrganisationDto } from './dto/update-organisation.dto'
import { Organisation } from './entities/organisation.entity'
import { Image } from '../images/entities/image.entity'
import { Pagination, PaginationOptionsInterface } from '../../helpers/paginate'
import {
  OrganisationsInvitationsService,
  OrganisationsInvitationsServiceError
} from '../organisations-invitations/organisations-invitations.service'
import { OrganisationsInvitation } from '../organisations-invitations/entities/organisations-invitation.entity'
import { getManager } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { SearchOrganisationDto } from './dto/search-organisation.dto'
import { User, UserPublic } from '../users/entities/user.entity'
import { CommonService } from '../common/services/common.service'
import { UserRolesService } from '../user-roles/user-roles.service'
import { Roles } from '../user-roles/user-roles.constants'

@Injectable()
export class OrganisationsService {
  constructor(
    @InjectRepository(Organisation)
    private readonly organisationRepository: Repository<Organisation>,
    private readonly invitationsService: OrganisationsInvitationsService,
    private readonly commonService: CommonService,
    private readonly userRolesService: UserRolesService,
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async create(
    createOrganisationDto: CreateOrganisationDto,
    invitationOwnerId: string
  ) {
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
      const result = await this.invitationsService.create(
        organisation.id,
        {
          email,
          invitee,
          admin: true
        },
        invitationOwnerId
      )
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
    { limit = 10, page = 0 }: PaginationOptionsInterface,
    filters: SearchOrganisationDto = {}
  ): Promise<Pagination<Organisation>> {
    let query = this.organisationRepository
      .createQueryBuilder('organisation')
      .leftJoinAndSelect('organisation.avatar', 'avatar')
      .take(limit)
      .skip(page * limit)

    if (filters.q) {
      query = query['where']('organisation.name ILIKE :name', {
        name: `%${filters.q}%`
      })
    }

    const [results, total] = await query.getManyAndCount()

    return new Pagination<Organisation>({
      results,
      total
    })
  }

  async findAllUsers(
    id: string,
    search: SearchOrganisationDto,
    options: PaginationOptionsInterface
  ): Promise<Pagination<UserPublic>> {
    let query = this.userRepository
      .createQueryBuilder('user')
      .innerJoin('user.teams', 'team')
      .innerJoin('team.organisation', 'organisation')
      .where('organisation.id = :id', { id })
      .take(options.limit)
      .skip(options.page * options.limit)

    if (search.q) {
      query = query.andWhere(
        new Brackets((qb) => {
          return qb.where('user.name ILIKE :q OR user.email = :email', {
            q: `%${search.q}%`,
            email: search.q.toLowerCase()
          })
        })
      )
    }

    const [results, total] = await query.getManyAndCount()

    return new Pagination<UserPublic>({
      results: this.commonService.mapUserPublic(results),
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

  /**
   * Verifies the token and responds to the invitation
   * either accepts or declines.
   *
   * @param token
   * @returns object (TeamInvitation)
   */

  async respondToInvitation(token: string, accept: boolean, userId: string) {
    const invitation = await this.invitationsService.verifyToken(token)

    if (typeof invitation === 'string') {
      return invitation
    }

    const roles = await this.userRolesService.getAllUserRoles(userId)

    const alreadyAdmin = roles.filter(
      (e) => e.organisation && e.organisation.id === invitation.organisation.id
    ).length

    // Delete the invitation if the user is already a member
    if (alreadyAdmin) {
      await this.invitationsService.remove(invitation.id)
      return invitation
    }

    if (accept) {
      await this.userRolesService.assignAdminRole(
        userId,
        {
          organisationId: invitation.organisation.id
        },
        false
      )
      return this.invitationsService.accept(invitation)
    } else {
      return this.invitationsService.decline(invitation)
    }
  }
}
