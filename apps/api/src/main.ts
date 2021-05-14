import { NestFactory, Reflector } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import {
  FastifyAdapter,
  NestFastifyApplication
} from '@nestjs/platform-fastify'
import fastifyMultipart from 'fastify-multipart'
import fastifyCors from 'fastify-cors'
import { ConfigService } from '@nestjs/config'
import { ApiModule } from './api.module'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { UploadGuard } from './guards/upload.guard'
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard'
import { IamGuard } from './guards/iam.guard'
import { EmailService } from './modules/common/email.service'
import { sendTemplatedEmail } from '../test/helpers/mocking'
import * as chalk from 'chalk'

declare const module: any

async function bootstrap() {
  const fastifyAdapter = new FastifyAdapter()
  fastifyAdapter.register(fastifyMultipart)
  fastifyAdapter.register(fastifyCors)

  const app = await NestFactory.create<NestFastifyApplication>(
    ApiModule,
    fastifyAdapter
  )
  app.setGlobalPrefix('api/v1')

  const config = new DocumentBuilder()
    .setTitle('Fitlink API')
    .setDescription('The Fitlink API on Nest')
    .setVersion('1.0')
    .addTag('fitlink')
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api/v1', app, document)

  app.useGlobalPipes(new ValidationPipe())
  app.useGlobalGuards(new UploadGuard(app.get(Reflector)))
  app.useGlobalGuards(new JwtAuthGuard(app.get(Reflector)))
  app.useGlobalGuards(new IamGuard(app.get(Reflector)))

  const configService = app.get(ConfigService)

  await app.listen(process.env.PORT || 3000)

  // Mock email service in local development
  // This writes all emails to the email-debug.log file in the root
  if (configService.get('EMAIL_DEBUG') === '1') {
    const emailService = app.get(EmailService)
    emailService.sendTemplatedEmail = sendTemplatedEmail
    console.log(
      chalk.bgMagenta('Notice') +
        chalk.bold(
          ' Emails are mocked to email-debug.log. Change this in your .env.local file under EMAIL_DEBUG'
        )
    )
  }

  if (module.hot) {
    module.hot.accept()
    module.hot.dispose(() => app.close())
  }
}

bootstrap()
