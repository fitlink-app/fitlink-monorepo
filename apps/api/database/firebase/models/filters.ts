import { LeagueAccessScope } from './league'

export interface GetLeagueFilter {
  keyword: string
  access: LeagueAccessScope[]
}
