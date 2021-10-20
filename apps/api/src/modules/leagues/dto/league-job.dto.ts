import { IsNotEmpty } from 'class-validator'

export class LeagueJobDto {
  @IsNotEmpty()
  verify_token: string
}
