import { define } from 'typeorm-seeding'
import Faker from 'faker'
import { GoalsEntry } from '../../src/modules/goals-entries/entities/goals-entry.entity'
import { User } from '../../src/modules/users/entities/user.entity'

interface Context {
  user: User
}

define(GoalsEntry, (faker: typeof Faker, context: Context) => {
  const entry = new GoalsEntry()

  entry.user = context.user

  entry.year = faker.random.number(2021)
  entry.day = faker.random.number(365)

  entry.target_calories = context.user.goal_calories
  entry.target_steps = context.user.goal_steps
  entry.target_floors_climbed = context.user.goal_floors_climbed
  entry.target_water_litres = context.user.goal_water_litres
  entry.target_sleep_hours = context.user.goal_sleep_hours

  entry.current_calories = faker.random.number(6000)
  entry.current_steps = faker.random.number(100000)
  entry.current_floors_climbed = faker.random.number(15)
  entry.current_water_litres = faker.random.number(5)
  entry.current_sleep_hours = faker.random.number(14)
  return entry
})
