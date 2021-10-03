import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Query
} from '@nestjs/common'
import { CreatePageDto } from './dto/create-page.dto'
import { Iam } from '../../decorators/iam.decorator'
import { Roles } from '../user-roles/user-roles.constants'
import { PagesService } from './pages.service'
import { CheckDomainDto } from './dto/check-domain.dto'
import { Public } from '../../decorators/public.decorator'

@Controller()
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Iam(Roles.TeamAdmin)
  @Post('/teams/:teamId/page')
  create(
    @Param('teamId') teamId: string,
    @Body() createPageDto: CreatePageDto
  ) {
    return this.pagesService.create(teamId, createPageDto)
  }

  @Iam(Roles.TeamAdmin)
  @Get('/teams/:teamId/page')
  async read(
    @Param('teamId') teamId: string,
    @Query() { checkDomain }: NodeJS.Dict<string>
  ) {
    if (checkDomain) {
      const taken = await this.pagesService.isDomainTaken(teamId, checkDomain)
      if (taken) {
        throw new ForbiddenException(
          'Domain is already taken. Please try another.'
        )
      }
      return true
    }

    const page = await this.pagesService.findOne(teamId)
    if (!page) {
      throw new NotFoundException()
    }
    return page
  }

  @Public()
  @Get('/pages/:domain')
  async readFromDomain(@Param('domain') domain: string) {
    if (domain.length > 1) {
      const page = await this.pagesService.findOneByDomain(domain)
      if (!page || !page.enabled) {
        throw new NotFoundException(
          'This page is not available or not yet published.'
        )
      }
      return page
    } else {
      throw new BadRequestException('Not a valid domain')
    }
  }
}
