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
import fastifyMultipart from 'fastify-multipart'
import { ConfigService } from '@nestjs/config'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import * as awsLambdaFastify from 'aws-lambda-fastify'
import {
  Context,
  APIGatewayProxyEvent,
  APIGatewayProxyResult
} from 'aws-lambda'
import { Logger } from '@nestjs/common'
import { createConnection } from 'typeorm'
import migrations from './migrations'
import { validationExceptionFactory } from './exceptions/validation.exception.factory'
import { UploadGuardV2 } from './guards/upload-v2.guard'

interface NestApp {
  app: NestFastifyApplication
  instance: FastifyInstance
}

let cachedNestApp: NestApp

async function bootstrapServer(): Promise<NestApp> {
  const serverOptions: FastifyServerOptions = { logger: true }
  const instance: FastifyInstance = fastify(serverOptions)

  const fastifyAdapter = new FastifyAdapter(instance)
  fastifyAdapter.register(fastifyMultipart)

  const app = await NestFactory.create<NestFastifyApplication>(
    ApiModule,
    fastifyAdapter,
    { logger: !process.env.AWS_EXECUTION_ENV ? new Logger() : console }
  )
  app.setGlobalPrefix(process.env.API_PREFIX)

  const configService = app.get(ConfigService)

  if (configService.get('ENABLE_SWAGGER') === '1') {
    const config = new DocumentBuilder()
      .setTitle('Fitlink API')
      .setDescription('The Fitlink API on Nest')
      .setVersion('1.0')
      .addTag('fitlink')
      .addBearerAuth()
      .build()

    const document = SwaggerModule.createDocument(app, config)
    SwaggerModule.setup('api/v1', app, document)
  }

  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: validationExceptionFactory
    })
  )
  app.useGlobalGuards(new UploadGuard(app.get(Reflector)))
  app.useGlobalGuards(new UploadGuardV2(app.get(Reflector)))
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
    await connection.close()
    throw e
  }
  await connection.close()
  return result
}
