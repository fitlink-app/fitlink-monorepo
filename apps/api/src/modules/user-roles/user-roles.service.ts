import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from '../users/entities/user.entity'
import { UsersService } from '../users/users.service'
import { CreateUserRoleDto } from './dto/create-user-role.dto'
import { UpdateUserRoleDto } from './dto/update-user-role.dto'
import { UserRole } from './entities/user-role.entity'

@Injectable()
export class UserRolesService {
  constructor(
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,

    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async create(
    createUserRoleDto: CreateUserRoleDto,
    userId: string,
    organisationId?: string
  ) {
    /**
     * In the User DTO we'll get the id of the entity they want to be the admin of.
     * e.g if there's a team Id we'll make them the admin of that team.
     */

    if (organisationId) {
      const isOwner = this.checkOwnerShip(organisationId, userId)
      if (!isOwner) throw new BadRequestException(`User not found`)
    }
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
      const isOwner = this.checkOwnerShip(organisationId, userId)
      if (!isOwner) throw new BadRequestException(`User not found`)
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
      const isOwner = this.checkOwnerShip(organisationId, userId)
      if (!isOwner) throw new BadRequestException(`User not found`)
    }
    return await this.userRoleRepository.delete({ id, user: { id: userId } })
  }

  assignSuperAdminRole(userId: string) {
    return `Boom just assigned super admin to #${userId}`
  }

  async checkOwnerShip(orgId: string, userId: string) {
    const result = await this.userRepository
      .createQueryBuilder('user')
      .innerJoin('user.teams', 'teams')
      .innerJoin('teams.organisation', 'organisation')
      .where('teams.organisation.id = :orgId', { orgId })
      .andWhere('user.id = :userId', { userId })
      .getOne()

    return !!result
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
}
