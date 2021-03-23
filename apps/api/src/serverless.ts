import { NestFactory, Reflector } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import {
  FastifyAdapter,
  NestFastifyApplication
} from '@nestjs/platform-fastify'
import { ApiModule } from './api.module'
import { UploadGuard } from './guards/upload.guard'
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard'
import { IamGuard } from './guards/iam.guard'
import { FastifyServerOptions, FastifyInstance, fastify } from 'fastify'
import * as awsLambdaFastify from 'aws-lambda-fastify'
import {
  Context,
  APIGatewayProxyEvent,
  APIGatewayProxyResult
} from 'aws-lambda'
import { Logger } from '@nestjs/common'
import { createConnection } from 'typeorm'
import migrations from './migrations'

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
  app.useGlobalPipes(new ValidationPipe())
  app.useGlobalGuards(new UploadGuard(app.get(Reflector)))
  app.useGlobalGuards(new JwtAuthGuard(app.get(Reflector)))
  app.useGlobalGuards(new IamGuard(app.get(Reflector)))
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
    logging: true,
    dropSchema: false,
    migrations: migrations
  })

  let result
  try {
    result = await connection.runMigrations({
      transaction: 'none'
    })
  } catch (e) {
    console.error(e)
  }
  await connection.close()
  return result
}
