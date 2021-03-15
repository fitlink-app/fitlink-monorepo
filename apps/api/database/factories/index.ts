import { createConnection, Connection, Repository } from 'typeorm'
import { User } from '../../src/modules/users/entities/user.entity'
// import { LeaderboardEntry } from '../../src/modules/leaderboard-entries/entities/leaderboard-entry.entity'
import { Organisation } from '../../src/modules/organisations/entities/organisation.entity'
import { Team } from '../../src/modules/teams/entities/team.entity'
import { Sport } from '../../src/modules/sports/entities/sport.entity'

import { SeedOrganisations } from './organisations'
import { SeedTeams } from './teams'
import { SeedUsers } from './users'
import { SeedSports } from './sports'

const maxOrganisations = 21
const maxUsers = 101
const maxTeamsPerOrganisation = 11

if (process.argv[2] === '--rollback') {
  rollback()
} else {
  seed()
}

async function seed() {
  const connection = await createConnection('seed')
  const seeder = new Seeder(connection)
  await seeder.seed()
  await connection.close()
}

async function rollback() {
  const connection = await createConnection('seed')
  const seeder = new Seeder(connection)

  // Run delet operations
  await seeder.delete()
  await connection.close()
}

class Seeder {
  data: { [key: string]: any[] }
  connection: Connection

  seedTeams: SeedTeams
  seedOrganisations: SeedOrganisations
  seedUsers: SeedUsers
  seedSports: SeedSports

  userRepository: Repository<User>
  organisationRepository: Repository<Organisation>
  teamRepository: Repository<Team>
  sportRepository: Repository<Sport>

  organisations: Organisation[] = []
  teams: Team[] = []
  users: User[] = []
  sports: Sport[] = []

  constructor(connection: Connection) {
    const repositories = {
      user: connection.getRepository(User),
      organisation: connection.getRepository(Organisation),
      team: connection.getRepository(Team),
      sport: connection.getRepository(Sport)
    }
    this.seedTeams = new SeedTeams(repositories, connection)
    this.seedOrganisations = new SeedOrganisations(repositories, connection)
    this.seedUsers = new SeedUsers(repositories, connection)
    this.seedSports = new SeedSports(repositories, connection)
  }

  async seed() {
    this.organisations = await this.seedOrganisations.seed(maxOrganisations)
    this.teams = await this.seedTeams.seed(
      this.organisations,
      maxTeamsPerOrganisation
    )
    this.users = await this.seedUsers.seed(maxUsers)

    this.sports = await this.seedSports.seed()

    // Associations
    await this.seedTeams.addUsersToTeams(this.users, this.teams)
  }

  async delete() {
    await this.seedUsers.deleteUsers()
    await this.seedTeams.deleteTeams()
    await this.seedOrganisations.deleteOrganisations()
    await this.seedSports.deleteSports()
  }

  async deleteLeaderboardEntries() {
    return this.connection
      .createQueryBuilder()
      .delete()
      .from(Organisation)
      .execute()
  }
}
