import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Request
} from '@nestjs/common'
import { SportsService } from './sports.service'
import { CreateSportDto } from './dto/create-sport.dto'
import { UpdateSportDto } from './dto/update-sport.dto'
import { Sport } from './entities/sport.entity'
import { Iam } from '../../decorators/iam.decorator'
import { Roles } from '../user-roles/entities/user-role.entity'

@Controller('sports')
export class SportsController {
  constructor(private readonly sportsService: SportsService) {}

  @Iam(Roles.SuperAdmin)
  @Post()
  create(@Body() createSportDto: CreateSportDto) {
    return this.sportsService.create(createSportDto)
  }

  @Iam(Roles.SuperAdmin)
  @Get()
  findAll(@Request() request) {
    return this.sportsService.findAll({
      limit: Object.prototype.hasOwnProperty.call(request.query, 'limit')
        ? request.query.limit
        : 10,

      page: Object.prototype.hasOwnProperty.call(request.query, 'page')
        ? request.query.page
        : 0
    })
  }

  @Iam(Roles.SuperAdmin)
  @Get(':id')
  findOne(@Param('id') id: string): Promise<Sport> {
    return this.sportsService.findOne(id)
  }

  @Iam(Roles.SuperAdmin)
  @Put(':id')
  update(@Param('id') id: string, @Body() updateSportDto: UpdateSportDto) {
    return this.sportsService.update(id, updateSportDto)
  }

  @Iam(Roles.SuperAdmin)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sportsService.remove(id)
  }
}
