import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common'
import { FeedItemsService } from './feed-items.service'
import { CreateFeedItemDto } from './dto/create-feed-item.dto'
import { UpdateFeedItemDto } from './dto/update-feed-item.dto'
import { ApiExcludeEndpoint } from '@nestjs/swagger'

@Controller()
export class FeedItemsController {
  constructor(private readonly feedItemsService: FeedItemsService) {}

  @ApiExcludeEndpoint()
  @Post()
  create(@Body() createFeedItemDto: CreateFeedItemDto) {
    return this.feedItemsService.create(createFeedItemDto)
  }

  // @ApiExcludeEndpoint()
  // @Get()
  // findAll() {
  //   return this.feedItemsService.findAll()
  // }

  // @ApiExcludeEndpoint()
  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.feedItemsService.findOne(+id)
  // }

  // @ApiExcludeEndpoint()
  // @Put(':id')
  // update(
  //   @Param('id') id: string,
  //   @Body() updateFeedItemDto: UpdateFeedItemDto
  // ) {
  //   return this.feedItemsService.update(+id, updateFeedItemDto)
  // }

  // @ApiExcludeEndpoint()
  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.feedItemsService.remove(+id)
  // }
}
