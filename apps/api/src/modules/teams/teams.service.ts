import { Injectable, UnauthorizedException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { AuthenticatedUser } from '../../models'
import { Organisation } from '../organisations/entities/organisation.entity'
import { TeamsInvitation } from '../teams-invitations/entities/teams-invitation.entity'
import { TeamsInvitationsService } from '../teams-invitations/teams-invitations.service'
import { User } from '../users/entities/user.entity'
import { CreateTeamDto } from './dto/create-team.dto'
import { UpdateTeamDto } from './dto/update-team.dto'
import { Team } from './entities/team.entity'

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team)
    private teamRepository: Repository<Team>,
    @InjectRepository(Organisation)
    private organisationRepository: Repository<Organisation>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(TeamsInvitation)
    private teamInvitationRepository: Repository<TeamsInvitation>,

    private teamInvitationService: TeamsInvitationsService
  ) {}

  /**
   * Creates a team and assigns it to an organisation.
   * @param createTeamDto
   * @param organisationId
   * @returns
   */
  async create(createTeamDto: CreateTeamDto, organisationId?: string) {
    const { avatar, name } = createTeamDto
    if (organisationId) {
      // Get the Organisation
      const organisation = await this.organisationRepository.findOne(
        organisationId
      )
      // Set it as the team organisation
      const team = await this.teamRepository.save(
        this.teamRepository.create({
          name,
          avatar,
          organisation
        })
      )

      return team
    }
    return `This action adds a new team `
  }

  async findAll(organisationId?: string) {
    if (organisationId) {
      return await this.teamRepository.find({
        where: {
          organisation: { id: organisationId }
        }
      })
    }
    return await this.teamRepository.find()
  }

  async findOne(id: string, organisationId?: string) {
    if (organisationId) {
      return await this.teamRepository.findOne({
        where: {
          id,
          organisation: { id: organisationId }
        }
      })
    }
    return await this.teamRepository.findOne(id)
  }

  async update(
    id: string,
    updateTeamDto: UpdateTeamDto,
    organisationId?: string
  ) {
    if (organisationId) {
      const isOwner = !!(await this.findOne(id, organisationId))
      if (!isOwner) {
        throw new UnauthorizedException(
          "That team doesn't belong to this organisation"
        )
      }
      return await this.teamRepository.save({
        id,
        ...updateTeamDto
      })
    }
    return await this.teamRepository.save({
      id,
      ...updateTeamDto
    })
  }

  async removeAvatar(id: string) {
    return await this.teamRepository.save({
      id,
      avatar: null
    })
  }

  async remove(id: string, organisationId?: string) {
    if (organisationId) {
      return `Deleted  team: ${id} assigned to this org: ${organisationId}`
    }
    return `Deleted team: ${id}`
  }

  async getAllUsersFromTeam(
    organisationId: string,
    teamId: string
  ): Promise<User[] | []> {
    const team = await this.teamRepository.findOne({
      where: { id: teamId, organisation: { id: organisationId } },
      relations: ['users']
    })
    if (!!!team) {
      throw new UnauthorizedException(`Team with ID: ${teamId} Not Found`)
    }
    return team.users
  }
  async deleteUserFromTeam(
    organisationId: string,
    teamId: string,
    userId: string
  ) {
    const isOwner = !!(await this.findOne(teamId, organisationId))
    if (!isOwner) {
      throw new UnauthorizedException(
        "That team doesn't belong to this organisation"
      )
    }
    return await this.userRepository
      .createQueryBuilder('users')
      .relation(User, 'teams')
      .of(userId)
      .remove(teamId)
  }

  async joinTeam(token: string, authenticated_user: AuthenticatedUser) {
    const invitation = (await this.teamInvitationService.verifyToken(
      token
    )) as TeamsInvitation

    const user = await this.userRepository.findOne(authenticated_user.id)

    await this.teamRepository
      .createQueryBuilder('team')
      .relation(Team, 'users')
      .of(invitation.team.id)
      .add(user)

    invitation.resolved_user = user
    const savedInvitation = await this.teamInvitationRepository.save(invitation)

    return savedInvitation
  }
}
