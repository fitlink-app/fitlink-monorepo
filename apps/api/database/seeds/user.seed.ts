import { Connection, Repository } from 'typeorm'
import { Seeder, Factory } from 'typeorm-seeding'
import { User } from '../../src/modules/users/entities/user.entity'
import { Organisation } from '../../src/modules/organisations/entities/organisation.entity'
import { Team } from '../../src/modules/teams/entities/team.entity'
import {
  UserRole,
  Roles
} from '../../src/modules/user-roles/entities/user-role.entity'
import { Subscription } from '../../src/modules/subscriptions/entities/subscription.entity'

/**
 * Note this seed should only be run
 * after importing Fitlink production sanitized data.
 * This seeds useful users for development / testing
 * and is not meant for production.
 * This creates 4 users:
 *
 * 1. superadmin@fitlinkapp.com / password
 * 2. organisationadmin@fitlinkapp.com / password
 * 3. teamadmin@fitlinkapp.com / password
 * 4. subscriptionadmin@fitlinkapp.com / password
 *
 */

export default class CreateTestUsers implements Seeder {
  connection: Connection

  public async run(factory: Factory, connection: Connection): Promise<any> {
    if (!process.env.TEST_SEED) {
      return
    }

    // Find the Fitlink organisation
    let organisation = await connection
      .getRepository(Organisation)
      .findOne({ name: 'Fitlink' })
    if (!organisation) {
      organisation = await connection.getRepository(Organisation).findOne({
        name: 'Fitlink'
      })
    }

    let team = await connection.getRepository(Team).findOne({ name: 'Fitlink' })
    if (!team) {
      team = await connection.getRepository(Team).findOne({
        name: 'Fitlink'
      })
    }

    let subscription = await connection
      .getRepository(Subscription)
      .findOne({ organisation })
    if (!subscription) {
      subscription = await connection.getRepository(Subscription).findOne({
        organisation
      })
    }

    let superAdmin = await connection
      .getRepository(User)
      .findOne({ email: 'superadmin@fitlinkapp.com' })
    if (!superAdmin) {
      superAdmin = await factory(User)().create({
        email: 'superadmin@fitlinkapp.com'
      })
    }

    let organisationAdmin = await connection
      .getRepository(User)
      .findOne({ email: 'organisationadmin@fitlinkapp.com' })
    if (!organisationAdmin) {
      organisationAdmin = await factory(User)().create({
        email: 'organisationadmin@fitlinkapp.com'
      })
    }

    let teamAdmin = await connection
      .getRepository(User)
      .findOne({ email: 'teamadmin@fitlinkapp.com' })
    if (!teamAdmin) {
      teamAdmin = await factory(User)().create({
        email: 'teamadmin@fitlinkapp.com'
      })
    }

    let subscriptionAdmin = await connection
      .getRepository(User)
      .findOne({ email: 'subscriptionadmin@fitlinkapp.com' })
    if (!subscriptionAdmin) {
      subscriptionAdmin = await factory(User)().create({
        email: 'subscriptionadmin@fitlinkapp.com'
      })
    }

    // Create roles for each
    await factory(UserRole)().create({
      user: superAdmin,
      role: Roles.SuperAdmin
    })

    await factory(UserRole)().create({
      user: organisationAdmin,
      role: Roles.OrganisationAdmin,
      organisation
    })

    await factory(UserRole)().create({
      user: teamAdmin,
      role: Roles.TeamAdmin,
      team
    })

    await factory(UserRole)().create({
      user: subscriptionAdmin,
      role: Roles.SubscriptionAdmin,
      subscription
    })
  }
}
