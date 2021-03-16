import { getRepositoryToken } from '@nestjs/typeorm'
import { ConfigService } from '@nestjs/config'

const env = {
  AUTH_JWT_SECRET: 'fitlink_jwt_secret',
  S3_ACCESS_KEY_ID: 'S3RVER',
  S3_SECRET_ACCESS_KEY: 'S3RVER',
  S3_ENDPOINT: 'http://localhost:9191',
  S3_BUCKET: 'test',
  S3_REGION: 'eu-west-2'
}

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
  useValue: mockConfigService()
})

export const mockConfigService = () => ({
  get(key: string) {
    return env[key] || 'fitlink'
  }
})
