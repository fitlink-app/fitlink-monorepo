import { getRepositoryToken } from '@nestjs/typeorm'
import { ConfigService } from '@nestjs/config'
import { readFile, writeFile } from 'fs/promises'
import { TemplatesType } from '../../src/modules/common/email.service'
import { config } from 'dotenv'
const path = require('path')

const dotenv = config({
  path: path.join(__dirname, '../../../..', '.env.test')
})

export const env = dotenv.parsed

process.env = { ...process.env, ...env }

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

export const mockFirebaseAdminService = () => ({
  app: () => ({
    messaging: () => ({
      send: (payload: any) => {
        console.log(payload)
      },
      sendMulticast: (payload: any) => {
        console.log(payload)
      }
    })
  })
})

export async function sendTemplatedEmail(
  template: TemplatesType,
  data: NodeJS.Dict<string>,
  toAddresses: string[],
  fromAddress: string
) {
  const content = await appendEmailContent(
    template,
    data,
    toAddresses,
    fromAddress
  )
  await writeFile('email-debug.log', JSON.stringify(content, null, 2))
  return '1'
}

async function appendEmailContent(
  template: TemplatesType,
  data: NodeJS.Dict<string>,
  toAddresses: string[],
  fromAddress = 'jest@example.com'
) {
  const content = await getEmailContent()
  content.push({
    data,
    template,
    toAddresses,
    fromAddress
  })
  return content
}

export async function emailHasContent(search: string) {
  const content = await readFile('email-debug.log')
  return content.toString().toLowerCase().indexOf(search.toLowerCase()) > -1
}

export async function getEmailContent() {
  try {
    const content = await readFile('email-debug.log')
    return JSON.parse(content.toString()) as {
      template: string
      data: NodeJS.Dict<string>
      toAddresses: string[]
      fromAddress: string
    }[]
  } catch (e) {
    return []
  }
}

export async function timeout(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, ms)
  })
}
