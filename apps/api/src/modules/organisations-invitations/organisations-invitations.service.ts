import {
  BadRequestException,
  Injectable,
  UnauthorizedException
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { FindManyOptions, Repository } from 'typeorm'
import { EmailService } from '../common/email.service'
import { CreateOrganisationsInvitationDto } from './dto/create-organisations-invitation.dto'
import { OrganisationsInvitation } from './entities/organisations-invitation.entity'
import { Pagination, PaginationOptionsInterface } from '../../helpers/paginate'
import { JwtService } from '@nestjs/jwt'
import { OrganisationInvitationJWT } from '../../models/organisation-invitation.jwt.model'
import { Organisation } from '../organisations/entities/organisation.entity'
import { User } from '../users/entities/user.entity'

export enum OrganisationsInvitationsServiceError {
  TokenExpired = 'The invitation can no longer be used',
  TokenInvalid = 'The invitation is invalid',
  TokenNotFound = 'The invitation cannot be found'
}

type InviteeInviter = {
  inviter: string
  invitee: string
}

@Injectable()
export class OrganisationsInvitationsService {
  constructor(
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    @InjectRepository(OrganisationsInvitation)
    private readonly invitationsRepository: Repository<OrganisationsInvitation>,
    @InjectRepository(Organisation)
    private readonly organisationsRepository: Repository<Organisation>
  ) {}

  async create(
    organisationId: string,
    createDto: CreateOrganisationsInvitationDto,
    ownerId: string
  ) {
    const organisation = new Organisation()
    organisation.id = organisationId

    const { email, invitee, admin } = createDto

    const owner = new User()
    owner.id = ownerId

    const invitation = await this.invitationsRepository.save(
      this.invitationsRepository.create({
        email,
        organisation,
        admin,
        owner,
        name: invitee
      })
    )

    const token = this.createToken(invitation.id)
    const inviteLink = this.createInviteLink(token)
    const org = await this.organisationsRepository.findOne(organisationId)

    await this.sendEmail(
      {
        invitee,
        inviter: org.name
      },
      email,
      inviteLink
    )

    return { invitation, inviteLink, token }
  }

  /**
   * Regenerates a token for an existing
   * organisation invitation.
   *
   * E.g. "Resend email" functionality.
   *
   * @param id
   * @returns jwt token
   */
  async resend(id: string) {
    const { email, name, organisation } = await this.findOne(id)

    const token = this.createToken(id)
    const inviteLink = this.createInviteLink(token)

    await this.sendEmail(
      {
        invitee: name,
        inviter: organisation.name
      },
      email,
      inviteLink
    )

    return { token, inviteLink }
  }

  /**
   * Generates an organisation invitation url
   * comprised of the JWT.
   *
   * @param token
   * @returns string
   */
  createInviteLink(token: string) {
    return this.configService.get('INVITE_URL').replace('{token}', token)
  }

  /**
   * Sends the invitation email via SES
   *
   * @param invitee
   * @param email
   * @param inviteLink
   * @returns string (MessageId)
   */
  sendEmail(
    { invitee, inviter }: InviteeInviter,
    email: string,
    inviteLink: string
  ) {
    return this.emailService.sendTemplatedEmail(
      'organisation-invitation',
      {
        INVITER_NAME: inviter,
        INVITEE_NAME: invitee,
        INVITE_LINK: inviteLink
      },
      [email]
    )
  }

  /**
   * Greates a JWT for the organisation invitation
   *
   * @param id
   * @returns string (JWT)
   */
  createToken(id: string) {
    const payload: OrganisationInvitationJWT = {
      iss: 'fitlinkapp.com',
      aud: 'fitlinkapp.com',
      sub: id,
      iat: new Date().getTime(),
      type: 'organisation-invitation'
    }

    return this.jwtService.sign(payload)
  }

  /**
   * Reads and verifies the JWT
   * @param token
   *
   * @returns object (JWT payload)
   */
  readToken(token: string) {
    try {
      this.jwtService.verify(token)
      const jwt = this.jwtService.decode(token)
      return (jwt as unknown) as OrganisationInvitationJWT
    } catch (e) {
      switch (e.message) {
        case 'jwt expired':
          return OrganisationsInvitationsServiceError.TokenExpired
        default:
          return OrganisationsInvitationsServiceError.TokenInvalid
      }
    }
  }

  /**
   * Verifies the token and retrieves the associated
   * organisation invitation entity object,
   * only if it has not yet been redeemed.
   *
   * @param token
   * @returns object (OrganisationInvitation)
   */

  async verifyToken(token: string) {
    const payload = this.readToken(token)

    // Return string errors
    if (typeof payload === 'string') {
      return payload as OrganisationsInvitationsServiceError
    }

    return this.invitationsRepository.findOne(payload.sub, {
      where: {},
      relations: ['organisation', 'owner']
    })
  }

  /**
   * Finds a paginated series of organisation invitations
   * based on where condition
   *
   * @param where
   * @param options
   * @returns object
   */
  async findAll(
    where: FindManyOptions<OrganisationsInvitation>['where'],
    options: PaginationOptionsInterface
  ): Promise<Pagination<OrganisationsInvitation>> {
    const [results, total] = await this.invitationsRepository.findAndCount({
      where,
      order: { created_at: 'DESC' },
      take: options.limit,
      skip: options.page * options.limit
    })
    return new Pagination<OrganisationsInvitation>({
      results,
      total
    })
  }

  /**
   * Finds a single organisation invitation
   * by id
   *
   * @param invitationId
   * @returns object
   */
  findOne(invitationId: string) {
    return this.invitationsRepository.findOne({
      where: {
        id: invitationId
      },
      relations: ['organisation']
    })
  }

  /**
   * Deletes an organisation invitation.
   *
   * While the JWT will remain valid, it won't
   * be verifiable due to the invitation
   * no longer existing in the database.
   *
   * @param id
   * @returns
   */
  remove(id: string) {
    return this.invitationsRepository.delete(id)
  }

  /**
   * Marks the invitation as accepted
   *
   * @param id
   * @returns
   */
  accept(invitation: OrganisationsInvitation) {
    invitation.accepted = true
    return this.invitationsRepository.save(invitation)
  }

  /**
   * Marks the invitation as declined
   *
   * @param id
   * @returns
   */
  decline(invitation: OrganisationsInvitation) {
    invitation.dismissed = true
    return this.invitationsRepository.save(invitation)
  }
}
