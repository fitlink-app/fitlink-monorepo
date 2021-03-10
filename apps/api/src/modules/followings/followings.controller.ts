import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common'
import { FollowingsService } from './followings.service'
import { CreateFollowingDto } from './dto/create-following.dto'
import { UpdateFollowingDto } from './dto/update-following.dto'

@Controller('followings')
export class FollowingsController {
  constructor(private readonly followingsService: FollowingsService) {}

  @Post()
  create(@Body() createFollowingDto: CreateFollowingDto) {
    return this.followingsService.create(createFollowingDto)
  }

  @Get()
  findAll() {
    return this.followingsService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.followingsService.findOne(+id)
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateFollowingDto: UpdateFollowingDto
  ) {
    return this.followingsService.update(+id, updateFollowingDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.followingsService.remove(+id)
  }
}
