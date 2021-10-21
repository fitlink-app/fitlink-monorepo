import {
  BadRequestException,
  Injectable,
  UnauthorizedException
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { FindManyOptions, Repository } from 'typeorm'
import { EmailService } from '../common/email.service'
import { CreateLeaguesInvitationDto } from './dto/create-leagues-invitation.dto'
import { LeaguesInvitation } from './entities/leagues-invitation.entity'
import { Pagination, PaginationOptionsInterface } from '../../helpers/paginate'
import { JwtService } from '@nestjs/jwt'
import { LeagueInvitationJWT } from '../../models/league-invitation.jwt.model'
import { LeaguesService } from '../leagues/leagues.service'
import { League } from '../leagues/entities/league.entity'
import { User, UserPublic } from '../users/entities/user.entity'
import { plainToClass } from 'class-transformer'
import { LeagueInvitePermission } from '../leagues/leagues.constants'
import { NotificationsService } from '../notifications/notifications.service'
import { NotificationAction } from '../notifications/notifications.constants'
import { CommonService } from '../common/services/common.service'
import { DeepLinkType } from '../../constants/deep-links'

@Injectable()
export class LeaguesInvitationsService {
  constructor(
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly leaguesService: LeaguesService,
    @InjectRepository(LeaguesInvitation)
    private readonly invitationsRepository: Repository<LeaguesInvitation>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private notificationsService: NotificationsService,
    private commonService: CommonService
  ) {}

  async create(
    league: League,
    inviterId: string,
    createDto: CreateLeaguesInvitationDto
  ) {
    const to = await this.usersRepository.findOneOrFail(createDto.userId)
    const from = await this.usersRepository.findOneOrFail(inviterId, {
      relations: ['avatar']
    })

    const invitation = await this.invitationsRepository.save(
      this.invitationsRepository.create({
        from_user: from,
        to_user: to,
        league
      })
    )

    const token = this.createToken(invitation.id)
    const fallbackLink =
      this.configService.get('SHORT_URL') +
      '/launch?type=' +
      DeepLinkType.LeagueInvitation
    const inviteLink = this.commonService.generateDynamicLink(
      DeepLinkType.LeagueInvitation,
      {},
      fallbackLink
    )

    // Deprecated method of invitation
    // const inviteLink = this.createInviteLink(token)

    if (to.email) {
      await this.sendEmail(
        league.name,
        from.name,
        to.name,
        to.email,
        inviteLink
      )
    }

    if (to.fcm_tokens && to.fcm_tokens.length) {
      await this.sendNotification(to, from, league)
    }

    // Also increment the user's invitations
    await this.usersRepository.increment(
      { id: to.id },
      'league_invitations_total',
      1
    )

    return {
      invitation: this.publicInvitation(invitation),
      inviteLink,
      token
    }
  }

  async sendNotification(user: User, from: User, league: League) {
    return this.notificationsService.create({
      user,
      action: NotificationAction.LeagueInvitation,
      subject: league.name,
      subject_id: league.id,
      avatar: from.avatar
    })
  }

  publicInvitation(invitation: LeaguesInvitation) {
    const exclude = { excludeExtraneousValues: true }
    const from_user = plainToClass(UserPublic, invitation.from_user, exclude)
    const to_user = plainToClass(UserPublic, invitation.to_user, exclude)
    return {
      ...invitation,
      from_user,
      to_user
    }
  }

  async getInvitableLeague(leagueId: string, inviterId: string) {
    const league = await this.leaguesService.findOneOwnedByOrParticipatingIn(
      leagueId,
      inviterId
    )

    if (!league) {
      return false
    }

    // If the league is owned by the inviter, proceed.
    // Otherwise, check invite permissions.
    if (
      (league.owner && league.owner.id === inviterId) ||
      league.invite_permission === LeagueInvitePermission.Participant
    ) {
      return league
    }

    return false

    // TODO: We should also check
    // 1. That the user being invited belongs to the team of the league (in case of team league)
    // 2. That the user being invited belongs to the organisation of the league (in case of org league)
  }

  /**
   * Generates a league invitation url
   * which simply deep links to the invitations
   * within the app.
   *
   * @param token
   * @returns string
   */
  createInviteLink(token: string) {
    return this.configService.get('INVITE_LEAGUE_URL').replace('{token}', token)
  }

  /**
   * Sends the invitation email via SES
   *
   * @param invitee The name of the user being invited
   * @param email The email of the user being invited
   * @param inviteLink The invitation link that will be in the email
   * @returns string (MessageId)
   */
  sendEmail(
    league: string,
    inviter: string,
    invitee: string,
    email: string,
    inviteLink: string
  ) {
    return this.emailService.sendTemplatedEmail(
      'league-invitation',
      {
        INVITER_NAME: inviter,
        INVITEE_NAME: invitee,
        INVITE_LINK: inviteLink,
        LEAGUE_NAME: league
      },
      [email]
    )
  }

  /**
   * Creates the JWT payload.
   * This is in a separate method to make mocking easy.
   * @param id
   * @returns object payload
   */
  getJwtPayload(invitationId: string) {
    const payload: LeagueInvitationJWT = {
      iss: 'fitlinkapp.com',
      aud: 'fitlinkapp.com',
      sub: invitationId,
      iat: new Date().getTime(),
      type: 'league-invitation'
    }
    return payload
  }

  /**
   * Greates a JWT for the league invitation
   *
   * @param id
   * @returns string (JWT)
   */
  createToken(invitationId: string) {
    return this.jwtService.sign(this.getJwtPayload(invitationId))
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
      return (jwt as unknown) as LeagueInvitationJWT
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
   * league invitation entity object,
   * only if it has not yet been redeemed.
   *
   * @param token
   * @returns object (LeagueInvitation)
   */

  verifyToken(token: string) {
    const payload = this.readToken(token)
    try {
      return this.invitationsRepository.findOneOrFail(payload.sub, {
        where: { accepted: false },
        relations: ['league']
      })
    } catch (e) {
      throw new UnauthorizedException('The invitation can no longer be used')
    }
  }

  /**
   * Finds a paginated series of league invitations
   * based on where condition
   *
   * @param where
   * @param options
   * @returns object
   */
  async findAll(
    where: FindManyOptions<LeaguesInvitation>['where'],
    options: PaginationOptionsInterface
  ): Promise<Pagination<LeaguesInvitation>> {
    const [results, total] = await this.invitationsRepository.findAndCount({
      where,
      order: { created_at: 'DESC' },
      take: options.limit,
      skip: options.page * options.limit,
      relations: [
        'league',
        'league.image',
        'league.team',
        'league.team.avatar',
        'league.organisation',
        'league.organisation.avatar',
        'league.sport',
        'to_user',
        'from_user',
        'from_user.avatar'
      ]
    })
    return new Pagination<LeaguesInvitation>({
      results: results.map(this.getPublic),
      total
    })
  }

  /**
   * Gets the public readable entity
   *
   * @param invitation
   * @returns
   */
  getPublic(invitation: LeaguesInvitation) {
    const from_user = plainToClass(UserPublic, invitation.from_user, {
      excludeExtraneousValues: true
    })

    const to_user = plainToClass(UserPublic, invitation.to_user, {
      excludeExtraneousValues: true
    })

    invitation.from_user = from_user
    invitation.to_user = to_user

    return invitation
  }

  /**
   * Finds a single league invitation
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
   * Deletes an league invitation.
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
