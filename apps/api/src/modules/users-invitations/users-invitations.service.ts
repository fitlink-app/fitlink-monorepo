import {
  BadRequestException,
  Injectable,
  UnauthorizedException
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { EmailService } from '../common/email.service'
import { CreateUsersInvitationDto } from './dto/create-users-invitation.dto'
import { JwtService } from '@nestjs/jwt'
import { UserInvitationJWT } from '../../models/user-invitation.jwt.model'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from '../users/entities/user.entity'
import { Repository } from 'typeorm'

@Injectable()
export class UsersInvitationsService {
  constructor(
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async create(inviterUserId: string, createDto: CreateUsersInvitationDto) {
    const inviter = await this.userRepository.findOne(inviterUserId)
    const { email, invitee } = createDto
    const token = this.createToken(inviter.id)
    const inviteLink = this.createInviteLink(token)
    await this.sendEmail(invitee, inviter.name, email, inviteLink)
    return { inviteLink, token }
  }

  /**
   * Generates an user invitation url
   * comprised of the JWT.
   *
   * @param token
   * @returns string
   */
  createInviteLink(token: string) {
    return this.configService.get('INVITE_USER_URL').replace('{token}', token)
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
    invitee: string,
    inviter: string,
    email: string,
    inviteLink: string
  ) {
    return this.emailService.sendTemplatedEmail(
      'user-invitation',
      {
        INVITER_NAME: inviter,
        INVITEE_NAME: invitee,
        INVITE_LINK: inviteLink
      },
      [email]
    )
  }

  /**
   * Creates a JWT for the user invitation
   *
   * @param id The id of the user who created the invitation (the user to follow on signup)
   * @returns string (JWT)
   */
  createToken(id: string) {
    const payload: UserInvitationJWT = {
      iss: 'fitlinkteams.com',
      aud: 'fitlinkteams.com',
      sub: id,
      type: 'user-invitation'
    }

    return this.jwtService.sign(payload, {
      expiresIn: '30d'
    })
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
      return jwt as unknown as UserInvitationJWT
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
}
