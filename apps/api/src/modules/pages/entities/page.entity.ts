import { CreatableEntity } from '../../../classes/entity/creatable'
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn
} from 'typeorm'

import { ApiProperty } from '@nestjs/swagger'
import { Team } from '../../teams/entities/team.entity'
import { Image } from '../../images/entities/image.entity'
import {
  PageContent,
  PageSignupContent,
  PageContact,
  PageBannerContent
} from '../page.constants'

@Entity()
export class Page extends CreatableEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string

  @OneToOne(() => Team, (team) => team.page)
  @JoinColumn()
  team: Team

  @OneToOne(() => Image)
  @JoinColumn()
  logo: Image

  @Column()
  domain: string

  @Column()
  enabled: boolean

  @Column({
    type: 'json'
  })
  banner: PageBannerContent

  @Column({
    type: 'json'
  })
  content: PageContent[]

  @Column({
    type: 'json'
  })
  contact: PageContact

  @Column({
    type: 'json'
  })
  signup: PageSignupContent
}
