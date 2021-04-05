import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CreateTeamDto } from './dto/create-team.dto'
import { UpdateTeamDto } from './dto/update-team.dto'
import { Team } from './entities/team.entity'
import { Image } from '../images/entities/image.entity'
import { Organisation } from '../organisations/entities/organisation.entity'

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team)
    private teamRepository: Repository<Team>,
    @InjectRepository(Image)
    private imageRepository: Repository<Image>,
    @InjectRepository(Organisation)
    private organisationRepository: Repository<Organisation>
  ) {}

  /**
   * Creates an activity along with associated images
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

  findAll(organisationId?: string) {
    if (organisationId) {
      return `This action returns all teams assigned to this organisation:${organisationId}`
    }
    return `Returns all the teams`
  }

  findOne(id: string) {
    return `This action returns a #${id} team`
  }

  update(id: string, updateTeamDto: UpdateTeamDto) {
    return `This action updates a #${id} team`
  }

  remove(id: string) {
    return `This action removes a #${id} team`
  }
}
