import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { FindManyOptions, Repository } from 'typeorm'
import { EmailService } from '../common/email.service'
import { CreateTeamsInvitationDto } from './dto/create-teams-invitation.dto'
import { TeamsInvitation } from './entities/teams-invitation.entity'
import { Pagination, PaginationOptionsInterface } from '../../helpers/paginate'
import { JwtService } from '@nestjs/jwt'
import { TeamInvitationJWT } from '../../models/team-invitation.jwt.model'
import { User, UserPublic } from '../users/entities/user.entity'
import { plainToClass } from 'class-transformer'
import { Team } from '../teams/entities/team.entity'

export enum TeamsInvitationsServiceError {
  TokenNotFound = 'The invitation cannot be found',
  TokenExpired = 'The invitation can no longer be used'
}

type InviteeInviter = {
  inviter: string
  invitee: string
}

@Injectable()
export class TeamsInvitationsService {
  constructor(
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    @InjectRepository(TeamsInvitation)
    private readonly invitationsRepository: Repository<TeamsInvitation>,
    @InjectRepository(Team)
    private readonly teamsRepository: Repository<Team>
  ) {}

  async create(createDto: CreateTeamsInvitationDto, ownerId: string) {
    const { email, team, invitee, admin } = createDto

    let inviteLink: string

    const inviterTeam = await this.teamsRepository.findOne(team.id)

    if (admin) {
      const owner = new User()
      owner.id = ownerId

      const invitation = await this.invitationsRepository.save(
        this.invitationsRepository.create({
          email,
          team,
          name: invitee,
          admin,
          owner
        })
      )

      const token = this.createToken(invitation.id)
      inviteLink = this.createInviteLink(token)

      await this.sendEmail(
        {
          invitee: invitee,
          inviter: inviterTeam.name
        },
        email,
        inviteLink,
        admin
      )

      return { invitation, inviteLink, token }
    } else {
      // Join links are not time-based and can be joined by anyone
      // with the link. Useful for Slack integrations for e.g.
      inviteLink = this.getJoinLink(inviterTeam).url

      await this.sendEmail(
        {
          invitee: invitee,
          inviter: inviterTeam.name
        },
        email,
        inviteLink,
        false
      )

      return { inviteLink }
    }
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
    const { email, name, admin, team } = await this.findOne(id)

    const token = this.createToken(id)
    const inviteLink = this.createInviteLink(token)

    await this.sendEmail(
      {
        invitee: name,
        inviter: team.name
      },
      email,
      inviteLink,
      admin
    )

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
    return this.configService.get('INVITE_URL').replace('{token}', token)
  }

  /**
   * Generates an team invitation url
   * comprised of the JWT.
   *
   * @param token
   * @returns string
   */
  getJoinLink(team: Team) {
    return {
      url: `${this.configService.get('SHORT_URL')}/join/${team.join_code}`
    }
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
    inviteLink: string,
    isAdmin: boolean
  ) {
    return this.emailService.sendTemplatedEmail(
      isAdmin ? 'team-admin-invitation' : 'team-invitation',
      {
        INVITER_NAME: inviter,
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
          return TeamsInvitationsServiceError.TokenExpired
        default:
          return TeamsInvitationsServiceError.TokenNotFound
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

  async verifyToken(token: string) {
    const payload = this.readToken(token)

    if (typeof payload === 'string') {
      return payload as TeamsInvitationsServiceError
    }

    const result = await this.invitationsRepository.findOne(payload.sub, {
      where: { accepted: false, dismissed: false },
      relations: ['team', 'owner']
    })

    if (result) {
      return {
        ...result,
        owner: plainToClass(UserPublic, result.owner)
      } as TeamsInvitation
    } else {
      return null
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
      skip: options.page * options.limit
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
      },
      relations: ['team']
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

  /**
   * Decline the invitation
   *
   * @param invitation
   * @returns object (TeamInvitation)
   */

  decline(invitation: TeamsInvitation) {
    invitation.dismissed = true
    return this.invitationsRepository.save(invitation)
  }

  /**
   * Accept the invitation
   *
   * @param invitation
   * @returns object (TeamInvitation)
   */

  accept(invitation: TeamsInvitation) {
    invitation.accepted = true
    return this.invitationsRepository.save(invitation)
  }
}
