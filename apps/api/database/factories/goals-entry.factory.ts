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

  entry.target_mindfulness_minutes = context.user.goal_mindfulness_minutes
  entry.target_steps = context.user.goal_steps
  entry.target_floors_climbed = context.user.goal_floors_climbed
  entry.target_water_litres = context.user.goal_water_litres
  entry.target_sleep_hours = context.user.goal_sleep_hours
  entry.target_active_minutes = context.user.goal_active_minutes

  entry.current_mindfulness_minutes = faker.random.number(59)
  entry.current_steps = faker.random.number(100000)
  entry.current_floors_climbed = faker.random.number(15)
  entry.current_water_litres = faker.random.number(5)
  entry.current_sleep_hours = faker.random.number(14)
  entry.current_active_minutes = faker.random.number(34)
  return entry
})
