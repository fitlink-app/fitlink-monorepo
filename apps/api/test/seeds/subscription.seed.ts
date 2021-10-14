import { Factory, Seeder } from 'typeorm-seeding'
import { Connection, Repository } from 'typeorm'
import { User } from '../../src/modules/users/entities/user.entity'
import { Subscription } from '../../src/modules/subscriptions/entities/subscription.entity'
import { Organisation } from '../../src/modules/organisations/entities/organisation.entity'
import * as faker from 'faker'

export class SubscriptionSeeder implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    const userRepository: Repository<User> = connection.getRepository(User)
    const users = await userRepository.find()
    const usersArray = users.slice(0, 3)

    const organisationRepository: Repository<Organisation> = connection.getRepository(
      Organisation
    )
    const organisation = await organisationRepository.findOne()

    await factory(Subscription)().create({
      billing_entity: organisation.name,
      billing_address_1: faker.address.streetAddress(),
      billing_address_2: faker.address.secondaryAddress(),
      billing_city: 'London',
      billing_country: 'United Kingdom',
      billing_state: 'London',
      billing_country_code: 'GB',
      billing_postcode: 'SW1A 1AA',
      default: true,
      users: usersArray,
      organisation: organisation
    })
  }
}

export class DeleteSubscriptionSeeder implements Seeder {
  public async run(_, connection: Connection): Promise<any> {
    const subscriptionRepository: Repository<Subscription> = connection.getRepository(
      Subscription
    )
    const subscription = await subscriptionRepository.findOne({
      where: { billing_city: 'London' },
      relations: ['users', 'organisation']
    })

    await subscriptionRepository
      .createQueryBuilder()
      .relation('organisation')
      .of(subscription)
      .set(null)

    await subscriptionRepository
      .createQueryBuilder()
      .relation('users')
      .of(subscription)
      .remove(subscription.users)

    await subscriptionRepository.remove(subscription)
  }
}
