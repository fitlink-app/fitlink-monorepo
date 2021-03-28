import {
  BadRequestException,
  Injectable,
  UnauthorizedException
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { FindManyOptions, Repository } from 'typeorm'
import { EmailService } from '../common/email.service'
import { CreateTeamsInvitationDto } from './dto/create-teams-invitation.dto'
import { TeamsInvitation } from './entities/teams-invitation.entity'
import { Pagination, PaginationOptionsInterface } from '../../helpers/paginate'
import { JwtService } from '@nestjs/jwt'
import { TeamInvitationJWT } from '../../models/team-invitation.jwt.model'

@Injectable()
export class TeamsInvitationsService {
  constructor(
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    @InjectRepository(TeamsInvitation)
    private readonly invitationsRepository: Repository<TeamsInvitation>
  ) {}

  async create(createDto: CreateTeamsInvitationDto) {
    const { email, team, invitee } = createDto
    const invitation = await this.invitationsRepository.save(
      this.invitationsRepository.create({
        email,
        team,
        name: invitee
      })
    )

    const token = this.createToken(invitation.id)
    const inviteLink = this.createInviteLink(token)

    await this.sendEmail(invitee, email, inviteLink)

    return { invitation, inviteLink, token }
  }

  /**
   * Regenerates a token for an existing
   * team invitation.
   *
   * E.g. "Resend email" functionality.
   *
   * @param id
   * @returns jwt token
   */
  async resend(id: string) {
    const { email, name } = await this.findOne(id)

    const token = this.createToken(id)
    const inviteLink = this.createInviteLink(token)

    await this.sendEmail(name, email, inviteLink)

    return { token, inviteLink }
  }

  /**
   * Generates an team invitation url
   * comprised of the JWT.
   *
   * @param token
   * @returns string
   */
  createInviteLink(token: string) {
    return this.configService.get('INVITE_TEAM_URL').replace('{token}', token)
  }

  /**
   * Sends the invitation email via SES
   *
   * @param invitee
   * @param email
   * @param inviteLink
   * @returns string (MessageId)
   */
  sendEmail(invitee: string, email: string, inviteLink: string) {
    return this.emailService.sendTemplatedEmail(
      'team-invitation',
      {
        INVITER_NAME: 'Fitlink',
        INVITEE_NAME: invitee,
        INVITE_LINK: inviteLink
      },
      [email]
    )
  }

  /**
   * Greates a JWT for the team invitation
   *
   * @param id
   * @returns string (JWT)
   */
  createToken(id: string) {
    const payload: TeamInvitationJWT = {
      iss: 'fitlinkapp.com',
      aud: 'fitlinkapp.com',
      sub: id,
      iat: new Date().getTime(),
      type: 'team-invitation'
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
      return (jwt as unknown) as TeamInvitationJWT
    } catch (e) {
      switch (e.message) {
        case 'jwt expired':
          throw new UnauthorizedException(
            'The invitation can no longer be used'
          )
        default:
          throw new BadRequestException('Token is invalid')
      }
    }
  }

  /**
   * Verifies the token and retrieves the associated
   * team invitation entity object,
   * only if it has not yet been redeemed.
   *
   * @param token
   * @returns object (TeamInvitation)
   */

  verifyToken(token: string) {
    const payload = this.readToken(token)
    try {
      return this.invitationsRepository.findOne(payload.sub, {
        where: { accepted: false },
        relations: ['team']
      })
    } catch (e) {
      return new UnauthorizedException('The invitation can no longer be used')
    }
  }

  /**
   * Finds a paginated series of team invitations
   * based on where condition
   *
   * @param where
   * @param options
   * @returns object
   */
  async findAll(
    where: FindManyOptions<TeamsInvitation>['where'],
    options: PaginationOptionsInterface
  ): Promise<Pagination<TeamsInvitation>> {
    const [results, total] = await this.invitationsRepository.findAndCount({
      where,
      order: { created_at: 'DESC' },
      take: options.limit,
      skip: options.page
    })
    return new Pagination<TeamsInvitation>({
      results,
      total
    })
  }

  /**
   * Finds a single team invitation
   * by id
   *
   * @param invitationId
   * @returns object
   */
  findOne(invitationId: string) {
    return this.invitationsRepository.findOne({
      where: {
        id: invitationId
      }
    })
  }

  /**
   * Deletes an team invitation.
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
}
