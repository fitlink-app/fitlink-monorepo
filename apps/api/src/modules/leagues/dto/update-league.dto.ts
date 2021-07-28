import { PartialType } from '@nestjs/mapped-types'
import { IsEmpty } from 'class-validator'
import { CreateLeagueDto } from './create-league.dto'

export class UpdateLeagueDto extends PartialType(CreateLeagueDto) {
  @IsEmpty({
    message: 'Sport cannot be changed'
  })
  sportId?: string
}
