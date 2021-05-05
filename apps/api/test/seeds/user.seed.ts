import { genSalt, hash } from 'bcrypt'
import { Connection, getManager, Repository } from 'typeorm'
import { Factory, Seeder } from 'typeorm-seeding'
import { Organisation } from '../../src/modules/organisations/entities/organisation.entity'
import { UserRole } from '../../src/modules/user-roles/entities/user-role.entity'
import { User } from '../../src/modules/users/entities/user.entity'
import { TeamsInvitation } from '../../src/modules/teams-invitations/entities/teams-invitation.entity'
import { Team } from '../../src/modules/teams/entities/team.entity'
const username = 'TestUser4'

export default class UserWithRolesSeed implements Seeder {
  public async run(_: Factory, connection: Connection): Promise<any> {
    const userRepository: Repository<User> = connection.getRepository(User)
    const userRoleRepository: Repository<UserRole> = connection.getRepository(
      UserRole
    )
    const organisationRepository: Repository<Organisation> = connection.getRepository(
      Organisation
    )

    const plainPassword = 'passwordIsATerriblePassword'
    const salt = await genSalt()
    const password = await hash(plainPassword, salt)
    const user = await userRepository.save(
      userRepository.create({
        name: username,
        email: `${username.toLowerCase()}@gmail.com`,
        password
      })
    )

    const organisation = await organisationRepository
      .createQueryBuilder('organisation')
      .innerJoinAndSelect('organisation.teams', 'teams')
      .innerJoinAndSelect('organisation.subscriptions', 'subscriptions')
      .where('teams.organisation.id = organisation.id')
      .andWhere('subscriptions.organisation.id = organisation.id')
      .getOne()

    const roles = [
      {
        organisation: organisation.id,
        role: 'organisation_admin'
      },
      {
        subscription: organisation.subscriptions[0].id,
        role: 'subscription_admin'
      },
      {
        team: organisation.teams[0].id,
        role: 'team_admin'
      }
    ]

    const requests = []
    roles.map((value) => {
      const newRole: {
        user: Partial<User>
        role: string
        subscription?: string
        organisation?: string
        team?: string
      } = { user: { id: user.id }, role: value.role }
      if (value.team) newRole.team = value.team
      if (value.organisation) newRole.organisation = value.organisation
      if (value.subscription) newRole.subscription = value.subscription
      requests.push(
        userRoleRepository.save(userRoleRepository.create(newRole as any))
      )
    })
    const result = await Promise.all(requests)
  }
}

export class DeleteUserWithRolesSeed implements Seeder {
  public async run(_: Factory, connection: Connection): Promise<any> {
    const userRepository: Repository<User> = connection.getRepository(User)
    const userRoleRepository: Repository<UserRole> = connection.getRepository(
      UserRole
    )

    const user = await userRepository.findOne({ name: username })
    const userRoles = await userRoleRepository.find({
      user: { id: user.id }
    })
    await getManager().transaction(async (entityManager) => {
      if (user) {
        if (userRoles.length) {
          await entityManager.delete(
            UserRole,
            userRoles.map((entity) => entity.id)
          )
        }
        return await entityManager.delete(User, user.id)
      }
    })
  }
}

export class UserSeeder implements Seeder {
  public async run(factory: Factory): Promise<any> {
    await factory(User)().createMany(1, {
      name: `Seeded User`
    })
  }
}

export class DeleteUserSeeder implements Seeder {
  public async run(_: Factory, connection: Connection): Promise<any> {
    const userRepository: Repository<User> = connection.getRepository(User)
    const user = await userRepository.find({
      where: { name: 'Seeded User' },
      relations: ['teams_invitations']
    })
    user.forEach(async (user) => {
      await userRepository.manager
        .getRepository(TeamsInvitation)
        .delete({ resolved_user: user })
      await userRepository
        .createQueryBuilder('users')
        .relation(User, 'teams')
        .of(user.id)
        .remove(user)
    })
    // console.log(user)
    await userRepository.remove(user)
  }
}
