import { NestFactory, Reflector } from '@nestjs/core'
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common'
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
import { validationExceptionFactory } from './exceptions/validation.exception.factory'
import { bgMagenta, bold } from 'chalk'
import { UploadGuardV2 } from './guards/upload-v2.guard'

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
    .addBearerAuth({
      bearerFormat: 'JWT',
      type: 'http',
      scheme: 'bearer'
    })
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api/v1', app, document, {
    swaggerOptions: {
      uiConfig: {
        operationsSorter: 'alpha'
      }
    }
  })

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)))

  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: validationExceptionFactory
    })
  )
  app.useGlobalGuards(new UploadGuardV2(app.get(Reflector)))
  app.useGlobalGuards(new UploadGuard(app.get(Reflector)))
  app.useGlobalGuards(new JwtAuthGuard(app.get(Reflector)))
  app.useGlobalGuards(new IamGuard(app.get(Reflector)))

  const configService = app.get(ConfigService)

  await app.listen(process.env.PORT || 3000)

  // Mock email service in local development
  // This writes all emails to the email-debug.log file in the root
  if (configService.get('EMAIL_DEBUG') === '1') {
    console.log(
      bgMagenta('Notice') +
        bold(
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
