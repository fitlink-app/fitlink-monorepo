import { getRepositoryToken } from '@nestjs/typeorm'
import { ConfigService } from '@nestjs/config'

export const mockRepositoryProvider = (entity) => {
  return {
    provide: getRepositoryToken(entity),
    useValue: mockRepository()
  }
}

export const mockRepository = () => ({
  findAndCount: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
  save: jest.fn(),
  insert: jest.fn()
})

export const mockConfigServiceProvider = () => ({
  provide: ConfigService,
  useValue: {
    get(key: string) {
      switch (key) {
        case 'AUTH_JWT_SECRET':
          return 'fitlink_jwt_secret'
        default:
          return 'fitlink'
      }
    }
  }
})

export const mockConfigService = () => ({
  get(key: string) {
    switch (key) {
      case 'AUTH_JWT_SECRET':
        return 'fitlink_jest_test_jwt_secret'
      default:
        return 'fitlink'
    }
  }
})
