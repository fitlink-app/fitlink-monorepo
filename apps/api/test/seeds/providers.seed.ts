import { User } from '../../src/modules/users/entities/user.entity'
import { Connection } from 'typeorm'
import { Factory, runSeeder, Seeder } from 'typeorm-seeding'
import { UsersSetup, UsersTeardown } from './users.seed'
import { Provider } from '../../src/modules/providers/entities/provider.entity'

export async function ProvidersSetup(name: string): Promise<User> {
  class Setup implements Seeder {
    public async run(_: Factory, connection: Connection): Promise<any> {
      const result = await this.setupDependencies()
      return result.user
    }

    async setupDependencies() {
      const users = await UsersSetup(name, 1)
      return { user: users[0] }
    }
  }
  return runSeeder(Setup)
}

export async function SeedProviderToUser(
  userId: string,
  type: string
): Promise<Provider> {
  class SeedProvider implements Seeder {
    public async run(_: Factory, connection: Connection): Promise<any> {
      const providerRepository = connection.getRepository(Provider)
      const provider = await providerRepository.save(
        providerRepository.create({
          user: { id: userId },
          token_expires_at: new Date(128761823123),
          type,
          refresh_token: 'refresh_token',
          token: 'Access_token',
          scopes: ['activity:read'],
          provider_user_id: '2019273'
        })
      )

      return provider
    }
  }

  return runSeeder(SeedProvider)
}

export async function ProvidersTeardown(name: string): Promise<void> {
  class Teardown implements Seeder {
    public async run(_: Factory, connection: Connection): Promise<any> {
      await this.teardownDependencies()
      const result = await connection
        .getRepository(Provider)
        .delete({ user: { name } })
      console.log(result)
    }
    async teardownDependencies() {
      await UsersTeardown(name)
    }
  }

  return runSeeder(Teardown)
}
