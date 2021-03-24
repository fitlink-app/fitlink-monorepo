import { IsNotEmpty } from 'class-validator'

export class CreateLeagueDto {
  @IsNotEmpty()
  sportId: string
  @IsNotEmpty()
  name: string
  @IsNotEmpty()
  description: string
}
