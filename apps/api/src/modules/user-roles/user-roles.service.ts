import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Organisation } from '../organisations/entities/organisation.entity'
import { Team } from '../teams/entities/team.entity'
import { User } from '../users/entities/user.entity'
import { CreateUserRoleDto } from './dto/create-user-role.dto'
import { UpdateUserRoleDto } from './dto/update-user-role.dto'
import { Roles, UserRole } from './entities/user-role.entity'

@Injectable()
export class UserRolesService {
  constructor(
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole> // @InjectRepository(Organisation)
  ) // private organisationRepository: Repository<Organisation>,

  // @InjectRepository(Team)
  // private teamRepository: Repository<Team>,

  // @InjectRepository(User)
  // private userRepository: Repository<User>
  {}

  async create(
    createUserRoleDto: CreateUserRoleDto,
    userId: string,
    organisationId?: string
  ) {
    /**
     * In the User DTO we'll get the id of the entity they want to be the admin of.
     * e.g if there's a team Id we'll make them the admin of that team.
     */

    const entity = this.filterDto(createUserRoleDto)
    const result = await this.userRoleRepository.save(
      this.userRoleRepository.create({
        role: createUserRoleDto.role,
        ...entity,
        user: { id: userId }
      })
    )

    return result
  }

  async getAllUserRoles(id: string) {
    return await this.userRoleRepository.find({
      where: {
        user: {
          id
        }
      }
    })
  }

  async update(
    updateUserRoleDto: UpdateUserRoleDto,
    id: string,
    organisationId: string,
    userId: string
  ) {
    if (organisationId) {
      const isOwner = this.checkOwnerShip()
      if (!isOwner) return
    }

    const entity = this.filterDto(updateUserRoleDto as any)
    return await this.userRoleRepository.save({
      id,
      ...entity,
      role: updateUserRoleDto.role,
      user: {
        id: userId
      }
    })
  }

  async remove(id: string, organisationId: string, userId: string) {
    if (organisationId) {
      const isOwner = this.checkOwnerShip()
      if (!isOwner) return
    }
    return await this.userRoleRepository.delete({ id, user: { id: userId } })
  }

  assignSuperAdminRole(userId: string) {
    return `Boom just assigned super admin to #${userId}`
  }

  checkOwnerShip(): boolean {
    return true
  }

  filterDto(dto: CreateUserRoleDto) {
    let arr = Object.keys(dto)
    let entity: {
      [key: string]: string
    } = {}
    if (arr.length > 2) {
      throw new BadRequestException(`Too many roles`)
    }

    arr.map((key) => {
      if (key === 'role') return
      if (key === undefined) return
      entity = {
        [key]: dto[key]
      }
    })

    return entity
  }

  // JWT Related Functions
  async assignOrganisationAdminRole(userId: string, organisationId: string) {}
  async assignTeamAdminRole(userId: string, teamId: string) {}
  async assignSubscriptionAdminRole(userId: string, subscriptionId: string) {}
}
