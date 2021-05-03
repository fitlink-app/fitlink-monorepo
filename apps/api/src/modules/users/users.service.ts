import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { formatRoles } from '../../helpers/formatRoles'
import { Repository } from 'typeorm'
import { JWTRoles } from '../../models'
import { UserRolesService } from '../user-roles/user-roles.service'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { User } from './entities/user.entity'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private userRolesService: UserRolesService
  ) {}

  async getRolesForToken(user: User):Promise<JWTRoles> {
    const roles = await this.userRolesService.getAllUserRoles(user.id)
    return formatRoles(roles)
  }

  create(createUserDto: CreateUserDto) {
    const user = this.userRepository.create(createUserDto)
    return this.userRepository.save(user)
  }

  findAll() {
    return `This action returns all users`
  }

  async findByEmail(email: string) {
    const user = await this.userRepository.findOne({
      where: {
        email
      }
    })
    return user
  }

  findOne(id: string) {
    return this.userRepository.findOne(id)
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`
  }

  remove(id: string) {
    return `This action removes a #${id} user`
  }
}
