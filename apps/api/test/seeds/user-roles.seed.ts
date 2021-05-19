import { UserRole } from '../../src/modules/user-roles/entities/user-role.entity'
import { Connection, Repository } from 'typeorm'
import { Factory, Seeder } from 'typeorm-seeding'
import { User } from '../../src/modules/users/entities/user.entity'
import { Organisation } from '../../src/modules/organisations/entities/organisation.entity'

export default class UserRolesSeeder implements Seeder {
  public async run(_: Factory, connection: Connection): Promise<any> {
    const organisationRepository: Repository<Organisation> = connection.getRepository(
      Organisation
    )
    const userRoleRepository: Repository<UserRole> = connection.getRepository(
      UserRole
    )
    const userRepository: Repository<User> = connection.getRepository(User)
    const user = await userRepository.findOne()
    const organisation = await organisationRepository.findOne()

    const userRole = await userRoleRepository.save(
      userRoleRepository.create({
        role: 'organisation_admin',
        user,
        organisation
      })
    )

    return userRole
  }
}
