import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common'
import { SportsService } from './sports.service'
import { CreateSportDto } from './dto/create-sport.dto'
import { UpdateSportDto } from './dto/update-sport.dto'

@Controller('sports')
export class SportsController {
  constructor(private readonly sportsService: SportsService) {}

  @Post()
  create(@Body() createSportDto: CreateSportDto) {
    return this.sportsService.create(createSportDto)
  }

  @Get()
  findAll() {
    return this.sportsService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sportsService.findOne(+id)
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateSportDto: UpdateSportDto) {
    return this.sportsService.update(+id, updateSportDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sportsService.remove(+id)
  }
}
