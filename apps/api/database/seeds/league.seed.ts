import { League } from '../../src/modules/leagues/entities/league.entity'
import { LeagueAccess } from '../../src/modules/leagues/leagues.constants'
import { Leaderboard } from '../../src/modules/leaderboards/entities/leaderboard.entity'
import { Image } from '../../src/modules/images/entities/image.entity'
import { Seeder, Factory } from 'typeorm-seeding'
import * as Faker from 'faker'
import { Connection } from 'typeorm'
import { Sport } from '../../src/modules/sports/entities/sport.entity'

const LEAGUES_COUNT = 37

export default class CreatePublicLeagues implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    const sportRepository = connection.getRepository(Sport)

    const running = await sportRepository.findOne({ name_key: 'running' })

    const starts_at = new Date()
    const ends_at = new Date(starts_at.getTime() + 7 * 24 * 60 * 60 * 1000)
    /**
     * Create leagues
     */
    return Promise.all(
      Array.from({ length: LEAGUES_COUNT }).map(async () => {
        const leaderboard = await factory(Leaderboard)().create()
        const image = await factory(Image)().create()
        const league = await factory(League)().create({
          leaderboards: [leaderboard],
          active_leaderboard: leaderboard,
          image,
          access: LeagueAccess.Public,
          duration: [7, 14, 28][Faker.random.number(2)],
          repeat: Faker.random.boolean(),
          sport: running,
          starts_at,
          ends_at
        })
        return league
      })
    )
  }
}
