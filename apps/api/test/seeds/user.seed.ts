import { genSalt, hash } from 'bcrypt'
import { Connection, getManager, Repository } from 'typeorm'
import { Factory, Seeder } from 'typeorm-seeding'
import { Organisation } from '../../src/modules/organisations/entities/organisation.entity'
import { TeamsInvitation } from '../../src/modules/teams-invitations/entities/teams-invitation.entity'
import { UserRole } from '../../src/modules/user-roles/entities/user-role.entity'
import { UsersSetting } from '../../src/modules/users-settings/entities/users-setting.entity'
import { PrivacySetting } from '../../src/modules/users-settings/users-settings.constants'
import { User } from '../../src/modules/users/entities/user.entity'
import { SubscriptionsSetup } from './subscriptions.seed'
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

    const subscriptions = await SubscriptionsSetup('User With Roles Seed')

    const organisation = await organisationRepository
      .createQueryBuilder('organisation')
      .innerJoinAndSelect('organisation.teams', 'teams')
      .innerJoinAndSelect('organisation.subscriptions', 'subscriptions')
      .where('teams.organisation.id = organisation.id')
      .andWhere('subscriptions.organisation.id = :id', {
        id: subscriptions[0].organisation.id
      })
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
    await userRepository.remove(user)
  }
}

export class UserWithSettingsSeeder implements Seeder {
  public async run(_, connection: Connection): Promise<any> {
    const userRepository: Repository<User> = connection.getRepository(User)
    const userSettingsRepository: Repository<UsersSetting> = connection.getRepository(
      UsersSetting
    )
    const plainPassword = 'passwordIsATerriblePassword'
    const salt = await genSalt()
    const password = await hash(plainPassword, salt)

    const settings = {
      privacy_activities: PrivacySetting.Public,
      privacy_daily_statistics: PrivacySetting.Private
    }

    const user = await userRepository.save(
      userRepository.create({
        name: 'User Settings',
        email: `randomEmail@gmail.com`,
        password
      })
    )

    const userSettings = await userSettingsRepository.save(
      userSettingsRepository.create({
        ...settings,
        user
      })
    )
  }
}

export class DeleteUserWithSettingsSeeder implements Seeder {
  public async run(_, connection: Connection): Promise<any> {
    const userRepository: Repository<User> = connection.getRepository(User)
    const user = await userRepository.findOne({
      where: { name: 'User Settings' },
      relations: ['settings']
    })

    await userRepository
      .createQueryBuilder('users')
      .relation(User, 'settings')
      .of(user.id)
      .set(null)

    await userRepository.remove(user)
  }
}

export class UsersSeeder implements Seeder {
  public async run(factory: Factory): Promise<any> {
    await factory(User)().createMany(10, {
      name: `Seeded User`
    })
  }
}
