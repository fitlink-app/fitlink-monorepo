import { NestFactory } from '@nestjs/core'
import {
  FastifyAdapter,
  NestFastifyApplication
} from '@nestjs/platform-fastify'
import { ApiModule } from './api.module'
import { FastifyServerOptions, FastifyInstance, fastify } from 'fastify'
import * as awsLambdaFastify from 'aws-lambda-fastify'
import {
  Context,
  APIGatewayProxyEvent,
  APIGatewayProxyResult
} from 'aws-lambda'
import { Logger } from '@nestjs/common'
import { createConnection } from 'typeorm'

interface NestApp {
  app: NestFastifyApplication
  instance: FastifyInstance
}

let cachedNestApp: NestApp

async function bootstrapServer(): Promise<NestApp> {
  const serverOptions: FastifyServerOptions = { logger: true }
  const instance: FastifyInstance = fastify(serverOptions)
  const app = await NestFactory.create<NestFastifyApplication>(
    ApiModule,
    new FastifyAdapter(instance),
    { logger: !process.env.AWS_EXECUTION_ENV ? new Logger() : console }
  )
  app.setGlobalPrefix(process.env.API_PREFIX)
  await app.init()
  return { app, instance }
}

export async function handler(
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> {
  if (!cachedNestApp) {
    cachedNestApp = await bootstrapServer()
  }
  const proxy = awsLambdaFastify(cachedNestApp.instance)
  return proxy(event, context)
}

export async function migrate() {
  const connection = await createConnection({
    type: 'postgres',
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    username: process.env.DB_USERNAME,
    host: process.env.DB_HOST,
    port: (process.env.DB_PORT as unknown) as number,
    synchronize: false,
    logging: false,
    dropSchema: false
  })
  const migrations = await connection.runMigrations({
    transaction: 'none'
  })
  await connection.close()
  return migrations
}
