import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { Brackets, Not, Repository } from 'typeorm'
import { tryAndCatch } from '../../helpers/tryAndCatch'
import { Image } from '../images/entities/image.entity'
import { Team } from '../teams/entities/team.entity'
import { CreatePageDto } from './dto/create-page.dto'
import { Page } from './entities/page.entity'

@Injectable()
export class PagesService {
  constructor(
    @InjectRepository(Page)
    private pagesRepository: Repository<Page>,
    private configService: ConfigService
  ) {}
  async create(
    teamId: string,
    {
      id,
      domain,
      logo,
      logo_id,
      banner_description,
      banner_image,
      banner_image_id,
      banner_join_link,
      banner_title,
      contact_number,
      contact_email,
      contact_facebook,
      contact_group_lead,
      contact_group_name,
      contact_linkedin,
      contact_instagram,
      contact_subtitle,
      contact_text,
      contact_twitter,
      contact_website,
      signup_description,
      signup_image,
      signup_image_id,
      signup_join_link,
      signup_title,
      content,
      enabled
    }: CreatePageDto
  ) {
    const update: Partial<Page> = {
      domain,
      banner: {
        banner_description,
        banner_image: banner_image as string,
        banner_image_id,
        banner_title,
        banner_join_link
      },
      contact: {
        contact_website,
        contact_number,
        contact_email,
        contact_facebook,
        contact_group_lead,
        contact_group_name,
        contact_instagram,
        contact_linkedin,
        contact_twitter,
        contact_subtitle,
        contact_text
      },
      signup: {
        signup_description,
        signup_title,
        signup_image: signup_image as string,
        signup_image_id,
        signup_join_link
      },
      content: content.map((e) => ({
        ...e,
        image: e.image as string
      })),
      enabled
    }

    if (logo_id) {
      update.logo = new Image()
      update.logo.id = logo_id
    }

    const team = new Team()
    team.id = teamId

    update.team = team

    if (id) {
      update.id = id
    }

    return this.pagesRepository.save(update)
  }

  async findOne(teamId: string) {
    const page = await this.pagesRepository.findOne(
      {
        team: {
          id: teamId
        }
      },
      {
        relations: ['logo', 'team']
      }
    )

    if (page) {
      return {
        id: page.id,
        ...page.banner,
        ...page.contact,
        ...page.signup,
        content: page.content,
        domain: page.domain,
        enabled: page.enabled,
        logo: page.logo.url,
        logo_id: page.logo.id,
        join_link: `${this.configService.get('SHORT_URL')}/join?code=${
          page.team.join_code
        }`
      } as CreatePageDto
    }
  }

  async findOneByDomain(domain: string) {
    const page = await this.pagesRepository.findOne(
      {
        domain
      },
      {
        relations: ['logo', 'team']
      }
    )

    if (page) {
      return {
        id: page.id,
        team_id: page.team.id,
        ...page.banner,
        ...page.contact,
        ...page.signup,
        content: page.content,
        domain: page.domain,
        enabled: page.enabled,
        logo: page.logo.url,
        logo_id: page.logo.id,
        join_link: `${this.configService.get('SHORT_URL')}/join?code=${
          page.team.join_code
        }`
      } as CreatePageDto
    }
  }

  async isDomainTaken(teamId: string, domain: string) {
    return this.pagesRepository.findOne({
      domain,
      team: {
        id: Not(teamId)
      }
    })
  }
}
