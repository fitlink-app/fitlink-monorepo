import { Test, TestingModule } from '@nestjs/testing'
import { LeaderboardsController } from './leaderboards.controller'
import { LeaderboardsService } from './leaderboards.service'

describe('LeaderboardsController', () => {
  let controller: LeaderboardsController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LeaderboardsController],
      providers: [LeaderboardsService]
    }).compile()

    controller = module.get<LeaderboardsController>(LeaderboardsController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
