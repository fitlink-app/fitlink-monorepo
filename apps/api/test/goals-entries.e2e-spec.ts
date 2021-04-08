import { mockApp } from './helpers/app'
import { NestFastifyApplication } from '@nestjs/platform-fastify'
import { GoalsEntry } from '../src/modules/goals-entries/entities/goals-entry.entity'
import { Connection, getConnection, Repository } from 'typeorm'
import { GoalsEntriesModule } from '../src/modules/goals-entries/goals-entries.module'
import { getAuthHeaders } from './helpers/auth'
import { RecreateGoalsEntryDto } from '../src/modules/goals-entries/dto/update-goals-entry.dto'

describe('GoalsEntries', () => {
  let app: NestFastifyApplication
  let seed: GoalsEntry[]
  let connection: Connection
  let followingRepository: Repository<GoalsEntry>
  let data

  beforeAll(async () => {
    app = await mockApp({
      imports: [GoalsEntriesModule],
      providers: [],
    })

    /** Load seeded data */
    connection = getConnection()
    followingRepository = connection.getRepository(GoalsEntry)
    seed = await followingRepository.find()
    data = seed.map((each) => {
      return ({
        userId: each.user.id,

        current_calories: 500,
        current_steps: 10000,
        current_floors_climbed: 5,
        current_water_litres: 1,
        current_sleep_hours: 7,
      })
    })
  })

  // Trying to create a new goals entry should result in 201 created
  it(`/POST (201) Trying to create a new goals entry should result in 201 created`, async () => {
    const userData = data.pop()
    const userAuthHeaders = getAuthHeaders({}, userData.userId)
    const result = await app.inject({
      method: 'POST',
      url: `/goals`,
      headers: userAuthHeaders,
    })
    expect(result.statusCode).toEqual(201)
    expect(result.statusMessage).toEqual('Created')
  })

    // Trying to update goals entry with complete "current_" data should result in 201 created (due to creating a new entry anyway)
    it(`/POST (201) Trying to update goals entry with complete "current_" data should result in 201 created (due to creating a new entry anyway)`, async () => {
      const userData = data.pop()
      const userAuthHeaders = getAuthHeaders({}, userData.userId)
      const  payload = {
        current_calories: userData.current_calories,
        current_steps: userData.current_steps,
        current_floors_climbed: userData.target_floors_climbed,
        current_water_litres: userData.current_water_litres,
        current_sleep_hours: userData.current_sleep_hours,
      } as RecreateGoalsEntryDto
      const result = await app.inject({
        method: 'POST',
        url: `/goals`,
        headers: userAuthHeaders,
        payload
      })
      expect(result.statusCode).toEqual(201)
      expect(result.statusMessage).toEqual('Created')
    })

    // Trying to update goals entry with part "current_" data should result in 201 created (due to creating a new entry anyway)
    it(`/POST (201) Trying to update goals entry with part "current_" data should result in 201 created (due to creating a new entry anyway)`, async () => {
      const userData = data.pop()
      const userAuthHeaders = getAuthHeaders({}, userData.userId)
      const  payload = {
        current_calories: userData.current_calories,
        current_steps: userData.current_steps,
        current_floors_climbed: userData.target_floors_climbed,
      } as RecreateGoalsEntryDto
      const result = await app.inject({
        method: 'POST',
        url: `/goals`,
        headers: userAuthHeaders,
        payload
      })
      expect(result.statusCode).toEqual(201)
      expect(result.statusMessage).toEqual('Created')
    })

})
