import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { formatRoles } from '../../helpers/formatRoles'
import { ILike, Repository } from 'typeorm'
import { JWTRoles } from '../../models'
import { UserRolesService } from '../user-roles/user-roles.service'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { User, UserPublic } from './entities/user.entity'
import { Image } from '../images/entities/image.entity'
import { Pagination, PaginationOptionsInterface } from '../../helpers/paginate'
import { plainToClass } from 'class-transformer'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private userRolesService: UserRolesService
  ) {}

  async getRolesForToken(user: User): Promise<JWTRoles> {
    const roles = await this.userRolesService.getAllUserRoles(user.id)
    return formatRoles(roles)
  }

  async create(createUserDto: CreateUserDto) {
    const user = this.userRepository.create(createUserDto)
    return this.userRepository.save(user)
  }

  async findAllUsers({
    limit = 10,
    page = 0
  }: PaginationOptionsInterface): Promise<Pagination<User>> {
    const [results, total] = await this.userRepository.findAndCount({
      take: limit,
      skip: page * limit,
      relations: ['settings']
    })
    return new Pagination<User>({
      results,
      total
    })
  }

  async searchByName(
    keyword: string,
    { limit = 10, page = 0 }: PaginationOptionsInterface
  ) {
    const [results, total] = await this.userRepository.findAndCount({
      take: limit,
      skip: page * limit,
      where: {
        name: ILike(`%${keyword}%`)
      }
    })
    return new Pagination<UserPublic>({
      results: results.map(this.getUserPublic),
      total
    })
  }

  async findByEmail(email: string) {
    const user = await this.userRepository.findOne({
      where: {
        email
      }
    })
    return user
  }

  getUserPublic(user: User) {
    return plainToClass(UserPublic, user, {
      excludeExtraneousValues: true
    })
  }

  findOne(id: string) {
    return this.userRepository.findOne(id, {
      relations: ['settings']
    })
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return this.userRepository.update(id, updateUserDto)
  }

  updatePassword(id: string, hashedPassword: string) {
    return this.userRepository.update(id, {
      password: hashedPassword,
      password_reset_at: new Date()
    })
  }

  updateAvatar(id: string, imageId: string) {
    const avatar = new Image()
    avatar.id = imageId
    return this.userRepository.update(id, {
      avatar
    })
  }

  updateFollowerCount(userId: string, count: number) {
    return this.userRepository.update(userId, {
      followers_total: count
    })
  }

  deleteAvatar(id: string) {
    return this.userRepository.update(id, {
      avatar: null
    })
  }

  // TODO: User removal is more complex
  // and requires that their relationships are
  // destroyed first in order. This will require a transaction.
  remove(id: string) {
    return this.userRepository.delete(id)
  }
}
