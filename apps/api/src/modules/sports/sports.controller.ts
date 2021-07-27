import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Request,
  Query
} from '@nestjs/common'
import { SportsService } from './sports.service'
import { CreateSportDto } from './dto/create-sport.dto'
import { UpdateSportDto } from './dto/update-sport.dto'
import { Sport } from './entities/sport.entity'
import { Iam } from '../../decorators/iam.decorator'
import { Roles } from '../user-roles/user-roles.constants'
import {
  ApiBaseResponses,
  DeleteResponse,
  UpdateResponse
} from '../../decorators/swagger.decorator'
import { ApiResponse, ApiTags } from '@nestjs/swagger'
import { PaginationQuery } from '../../helpers/paginate'
import { Pagination } from '../../decorators/pagination.decorator'

@ApiBaseResponses()
@Controller('sports')
@ApiTags('sports')
export class SportsController {
  constructor(private readonly sportsService: SportsService) {}

  /**
   * Only Superadmins can add new sports
   * @param createSportDto
   * @returns
   */
  @Iam(Roles.SuperAdmin)
  @Post()
  @ApiResponse({ type: Sport, status: 201 })
  create(@Body() createSportDto: CreateSportDto) {
    return this.sportsService.create(createSportDto)
  }

  /**
   * Gets all sports
   * @returns
   */
  @Get()
  @ApiResponse({ type: Sport, isArray: true, status: 200 })
  findAll(@Pagination() pagination: PaginationQuery) {
    return this.sportsService.findAll(pagination)
  }

  /**
   * Gets a single sport by id
   * @param id
   * @returns
   */
  @Iam(Roles.SuperAdmin)
  @Get(':id')
  @ApiResponse({ type: Sport, status: 200 })
  findOne(@Param('id') id: string): Promise<Sport> {
    return this.sportsService.findOne(id)
  }

  /**
   * Updates a single sport
   * @param id
   * @returns
   */
  @Iam(Roles.SuperAdmin)
  @Put(':id')
  @UpdateResponse()
  update(@Param('id') id: string, @Body() updateSportDto: UpdateSportDto) {
    return this.sportsService.update(id, updateSportDto)
  }

  @Iam(Roles.SuperAdmin)
  @Delete(':id')
  @DeleteResponse()
  remove(@Param('id') id: string) {
    return this.sportsService.remove(id)
  }
}
