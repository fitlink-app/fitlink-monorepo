import { Connection, Repository } from 'typeorm'

type RepositoryDictionary = { [key: string]: Repository<any> }

export class Seeder {
  repository: RepositoryDictionary = {}
  connection: Connection

  constructor(repositories: RepositoryDictionary, connection: Connection) {
    this.repository = repositories
    this.connection = connection
  }
}
