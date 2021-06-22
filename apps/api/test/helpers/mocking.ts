import { getRepositoryToken } from '@nestjs/typeorm'
import { ConfigService } from '@nestjs/config'
import { appendFile, readFile } from 'fs/promises'
import { TemplatesType } from '../../src/modules/common/email.service'
import { config } from 'dotenv'
const path = require('path')

const dotenv = config({
  path: path.join(__dirname, '../../../..', '.env.test')
})

export const env = dotenv.parsed

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

export const mockConfigService = () => {
  const env = dotenv.parsed

  if (!env) {
    throw new Error('Could not parse .env.test. Does the file exist?')
  }

  return {
    get(key: string) {
      return env[key] || 'fitlink'
    }
  }
}

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

export async function timeout(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, ms)
  })
}
