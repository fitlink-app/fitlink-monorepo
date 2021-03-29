import { getRepositoryToken } from '@nestjs/typeorm'
import { ConfigService } from '@nestjs/config'
import { appendFile, readFile } from 'fs/promises'
import { TemplatesType } from '../../src/modules/common/email.service'

const env = {
  AUTH_JWT_SECRET: 'fitlink_jwt_secret',
  S3_ACCESS_KEY_ID: 'S3RVER',
  S3_SECRET_ACCESS_KEY: 'S3RVER',
  S3_ENDPOINT: 'http://localhost:9191',
  S3_BUCKET: 'test',
  S3_REGION: 'eu-west-2',
  IMIN_API_BASE_URL: 'https://search.imin.co',
  IMIN_API_KEY: 'jAyxqV1IVTlcPeQV2aujF05X0483cOKu',
  INVITE_ORGANISATION_URL: 'http://localhost:3001/signup?invite={token}',
  FIREBASE_BEARER_TOKEN: 'fitlinkLeaderboardEntryToken'
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

export const mockEmailService = () => ({
  sendTemplatedEmail
})

export async function sendTemplatedEmail(
  template: TemplatesType,
  data: NodeJS.Dict<string>,
  toAddresses: string[],
  fromAddress: string
) {
  const email = getEmailTemplate(template, data, toAddresses, fromAddress)
  await appendFile('email-debug.log', email)
  return '1'
}

function getEmailTemplate(
  template: TemplatesType,
  data: NodeJS.Dict<string>,
  toAddresses: string[],
  fromAddress = 'jest@example.com'
) {
  return `
-------------------------
Template: ${template}
To: ${toAddresses.join(',')}
From: ${fromAddress}
-------------------------
${JSON.stringify(data, null, 2)}
`
}

export async function emailHasContent(search: string) {
  const content = await readFile('email-debug.log')
  return content.toString().toLowerCase().indexOf(search.toLowerCase()) > -1
}
