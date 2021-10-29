import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { FindManyOptions, Repository } from 'typeorm'
import { EmailService } from '../common/email.service'
import { CreateSubscriptionsInvitationDto } from './dto/create-subscriptions-invitation.dto'
import { SubscriptionsInvitation } from './entities/subscriptions-invitation.entity'
import { Pagination, PaginationOptionsInterface } from '../../helpers/paginate'
import { JwtService } from '@nestjs/jwt'
import { SubscriptionInvitationJWT } from '../../models/subscription-invitation.jwt.model'
import { User, UserPublic } from '../users/entities/user.entity'
import { plainToClass } from 'class-transformer'
import { Subscription } from './entities/subscription.entity'

export enum SubscriptionsInvitationsServiceError {
  TokenNotFound = 'The invitation cannot be found',
  TokenExpired = 'The invitation can no longer be used',
  OrganisationNotExists = 'The subscription is not linked to an organisation'
}

type InviteeInviter = {
  inviter: string
  invitee: string
}

@Injectable()
export class SubscriptionsInvitationsService {
  constructor(
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    @InjectRepository(SubscriptionsInvitation)
    private readonly invitationsRepository: Repository<SubscriptionsInvitation>,
    @InjectRepository(Subscription)
    private readonly subscriptionsRepository: Repository<Subscription>
  ) {}

  async create(createDto: CreateSubscriptionsInvitationDto, ownerId: string) {
    const { email, subscription, invitee } = createDto

    const owner = new User()
    owner.id = ownerId

    const invitation = await this.invitationsRepository.save(
      this.invitationsRepository.create({
        email,
        subscription,
        name: invitee,
        owner
      })
    )

    const token = this.createToken(invitation.id)
    const inviteLink = this.createInviteLink(token)
    const inviterSubscription = await this.subscriptionsRepository.findOne(
      subscription.id,
      {
        relations: ['organisation']
      }
    )

    await this.sendEmail(
      {
        invitee: invitee,
        inviter: inviterSubscription.organisation.name
      },
      email,
      inviteLink
    )

    return { invitation, inviteLink, token }
  }

  /**
   * Regenerates a token for an existing
   * subscription invitation.
   *
   * E.g. "Resend email" functionality.
   *
   * @param id
   * @returns jwt token
   */
  async resend(id: string) {
    const { email, name, subscription } = await this.findOne(id)

    const token = this.createToken(id)
    const inviteLink = this.createInviteLink(token)

    await this.sendEmail(
      {
        invitee: name,
        inviter: subscription.organisation.name
      },
      email,
      inviteLink
    )

    return { token, inviteLink }
  }

  /**
   * Generates an subscription admin invitation url
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
      'subscription-invitation',
      {
        INVITER_NAME: inviter,
        INVITEE_NAME: invitee,
        INVITE_LINK: inviteLink
      },
      [email]
    )
  }

  /**
   * Greates a JWT for the subscription invitation
   *
   * @param id
   * @returns string (JWT)
   */
  createToken(id: string) {
    const payload: SubscriptionInvitationJWT = {
      iss: 'fitlinkapp.com',
      aud: 'fitlinkapp.com',
      sub: id,
      type: 'subscription-invitation'
    }

    return this.jwtService.sign(payload, {
      expiresIn: '7d'
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
      return (jwt as unknown) as SubscriptionInvitationJWT
    } catch (e) {
      switch (e.message) {
        case 'jwt expired':
          return SubscriptionsInvitationsServiceError.TokenExpired
        default:
          return SubscriptionsInvitationsServiceError.TokenNotFound
      }
    }
  }

  /**
   * Verifies the token and retrieves the associated
   * susbcription invitation entity object,
   * only if it has not yet been redeemed.
   *
   * @param token
   * @returns object (SubscriptionInvitation)
   */

  async verifyToken(token: string) {
    const payload = this.readToken(token)

    if (typeof payload === 'string') {
      return payload as SubscriptionsInvitationsServiceError
    }

    const result = await this.invitationsRepository.findOne(payload.sub, {
      where: { accepted: false, dismissed: false },
      relations: ['subscription', 'owner', 'subscription.organisation']
    })

    if (result) {
      return {
        ...result,
        owner: plainToClass(UserPublic, result.owner)
      } as SubscriptionsInvitation
    } else {
      return null
    }
  }

  /**
   * Finds a paginated series of subscription invitations
   * based on where condition
   *
   * @param where
   * @param options
   * @returns object
   */
  async findAll(
    where: FindManyOptions<SubscriptionsInvitation>['where'],
    options: PaginationOptionsInterface
  ): Promise<Pagination<SubscriptionsInvitation>> {
    const [results, total] = await this.invitationsRepository.findAndCount({
      where,
      order: { created_at: 'DESC' },
      take: options.limit,
      skip: options.page * options.limit
    })
    return new Pagination<SubscriptionsInvitation>({
      results,
      total
    })
  }

  /**
   * Finds a single subscription invitation
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
      relations: ['subscription', 'subscription.organisation']
    })
  }

  /**
   * Deletes a subscription invitation.
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
   * @returns object (SubscriptionsInvitation)
   */

  decline(invitation: SubscriptionsInvitation) {
    invitation.dismissed = true
    return this.invitationsRepository.save(invitation)
  }

  /**
   * Accept the invitation
   *
   * @param invitation
   * @returns object (SubscriptionsInvitation)
   */

  accept(invitation: SubscriptionsInvitation) {
    invitation.accepted = true
    return this.invitationsRepository.save(invitation)
  }
}
