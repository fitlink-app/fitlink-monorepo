import { UserRole } from '../../src/modules/user-roles/entities/user-role.entity'
import { Connection, Repository } from 'typeorm'
import { Factory, runSeeder, Seeder } from 'typeorm-seeding'
import { OrganisationsSetup, OrganisationsTeardown } from './organisations.seed'
import { UsersSetup, UsersTeardown } from './users.seed'
import { Roles } from '../../src/modules/user-roles/user-roles.constants'

export async function UserRolesSetup(name: string): Promise<UserRole> {
  class Setup implements Seeder {
    public async run(_: Factory, connection: Connection): Promise<any> {
      const { user, organisation } = await this.setupDependencies()
      const userRoleRepository: Repository<UserRole> = connection.getRepository(
        UserRole
      )
      const userRole = await userRoleRepository.save(
        userRoleRepository.create({
          role: Roles.OrganisationAdmin,
          user,
          organisation
        })
      )

      return userRole
    }

    async setupDependencies() {
      const organisations = await OrganisationsSetup(name, 1)
      const users = await UsersSetup(name, 1)
      return {
        user: users[0],
        organisation: organisations[0]
      }
    }
  }

  return runSeeder(Setup)
}

export async function UserRolesTeardown(name: string): Promise<void> {
  class Teardown implements Seeder {
    public async run(_: Factory, connection: Connection): Promise<any> {
      await connection.getRepository(UserRole).delete({
        user: { name }
      })

      await this.teardownDependencies()
    }

    async teardownDependencies() {
      await UsersTeardown(name)
      await OrganisationsTeardown(name)
    }
  }

  return runSeeder(Teardown)
}
