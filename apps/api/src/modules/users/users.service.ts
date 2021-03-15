import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { User } from './entities/user.entity'
import { JWTRoles } from '../../models'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  getRolesForToken(user: User): JWTRoles {
    return {
      /** Org admin */
      o_a: ['39872387239857240'],

      /** Team admin */
      t_a: ['39872387239857239'],

      /** Super admin */
      s_a: true
    }
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
