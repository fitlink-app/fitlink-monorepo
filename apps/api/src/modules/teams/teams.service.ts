import { Injectable, UnauthorizedException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Organisation } from '../organisations/entities/organisation.entity'
import { CreateTeamDto } from './dto/create-team.dto'
import { UpdateTeamDto } from './dto/update-team.dto'
import { Team } from './entities/team.entity'

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team)
    private teamRepository: Repository<Team>,
    @InjectRepository(Organisation)
    private organisationRepository: Repository<Organisation>
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
      const isOwner = !!(await this.teamRepository.findOne({
        where: {
          id: id,
          organisation: { id: organisationId }
        }
      }))
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
}
