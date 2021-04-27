import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards
} from '@nestjs/common'
import { UsersService } from './users.service'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { Iam } from '../../decorators/iam.decorator'
import { Roles } from '../user-roles/entities/user-role.entity'

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto)
  }

  @Get()
  findAll() {
    return this.usersService.findAll()
  }

  @UseGuards(JwtAuthGuard)
  @Iam(Roles.Self)
  @Get(':userId')
  findOne(@Param('userId') id: string) {
    return this.usersService.findOne(id)
  }

  @Iam(Roles.Self)
  @Put(':userId')
  update(@Param('userId') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto)
  }

  @Iam(Roles.Self)
  @Delete(':userId')
  remove(@Param('userId') id: string) {
    return this.usersService.remove(id)
  }

  @Get('/getRolesForToken/:userId')
  getRolesForToken(@Param('userId') userId: string) {
    return this.usersService.getRolesForToken({ id: userId } as any)
  }
}
