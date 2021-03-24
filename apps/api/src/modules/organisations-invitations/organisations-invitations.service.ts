import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { EmailService } from '../common/email.service'
import { CreateOrganisationsInvitationDto } from './dto/create-organisations-invitation.dto'
import { UpdateOrganisationsInvitationDto } from './dto/update-organisations-invitation.dto'
import { OrganisationsInvitation } from './entities/organisations-invitation.entity'
import { Pagination, PaginationOptionsInterface } from '../../helpers/paginate'
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class OrganisationsInvitationsService {
  constructor(
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    @InjectRepository(OrganisationsInvitation)
    private readonly invitationsRepository: Repository<OrganisationsInvitation>
  ) {}

  async create(createDto: CreateOrganisationsInvitationDto) {
    const { email, organisation, invitee } = createDto
    const invitation = await this.invitationsRepository.save(
      this.invitationsRepository.create({
        email,
        organisation
      })
    )

    const token = this.createToken(invitation.id)
    const inviteLink = this.configService
      .get('INVITE_ORGANISATION_URL')
      .replace('{token}', token)

    await this.emailService.sendTemplatedEmail(
      'organisation-invitation',
      {
        INVITER_NAME: 'Fitlink',
        INVITEE_NAME: invitee,
        INVITE_LINK: inviteLink
      },
      [email]
    )

    return invitation
  }

  createToken(id: string) {
    const payload = {
      iss: 'fitlinkapp.com',
      sub: id,
      iat: new Date().getTime(),
      type: 'organisation-invite'
    }

    return this.jwtService.sign(payload)
  }

  async findAll(
    options: PaginationOptionsInterface
  ): Promise<Pagination<OrganisationsInvitation>> {
    const [results, total] = await this.invitationsRepository.findAndCount({
      order: { created_at: 'DESC' },
      take: options.limit,
      skip: options.page
    })
    return new Pagination<OrganisationsInvitation>({
      results,
      total
    })
  }

  findOne(invitationId: string) {
    return this.invitationsRepository.findOne({
      where: {
        id: invitationId
      }
    })
  }

  update(id: string, updateDto: UpdateOrganisationsInvitationDto) {
    return this.invitationsRepository.update(id, updateDto)
  }

  remove(id: string) {
    return this.invitationsRepository.delete(id)
  }
}
