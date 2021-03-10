import { Test, TestingModule } from '@nestjs/testing'
import { LeaderboardsService } from './leaderboards.service'

describe('LeaderboardsService', () => {
  let service: LeaderboardsService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LeaderboardsService]
    }).compile()

    service = module.get<LeaderboardsService>(LeaderboardsService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
