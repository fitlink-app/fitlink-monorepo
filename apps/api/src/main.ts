import { HttpAdapterHost, NestFactory, Reflector } from '@nestjs/core'
import {
  ClassSerializerInterceptor,
  HttpService,
  ValidationPipe
} from '@nestjs/common'
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
import { validationExceptionFactory } from './exceptions/validation.exception.factory'
import { bgMagenta, bold } from 'chalk'
import { UploadGuardV2 } from './guards/upload-v2.guard'
import { GlobalExceptionsFilter } from './filters/global-exception-filter'
import { StripPasswordInterceptor } from './interceptors/strip-password.interceptor'
import {
  utilities as nestWinstonModuleUtilities,
  WinstonModule,
} from 'nest-winston';
import * as winston from 'winston';
import * as WinstonCloudWatch from 'winston-cloudwatch';

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
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalInterceptors(new StripPasswordInterceptor());

  app.useGlobalFilters(
    new GlobalExceptionsFilter(
      app.get(HttpAdapterHost).httpAdapter,
      app.get(HttpService),
      app.get(ConfigService)
    )
  )

  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: validationExceptionFactory,
      whitelist: true
    })
  )
  app.useGlobalGuards(new UploadGuardV2(app.get(Reflector)))
  app.useGlobalGuards(new UploadGuard(app.get(Reflector)))
  app.useGlobalGuards(new JwtAuthGuard(app.get(Reflector)))
  app.useGlobalGuards(new IamGuard(app.get(Reflector)))

  const configService = app.get(ConfigService)


  if (configService.get('CLOUDWATCH_GROUP_NAME')) {
    app.useLogger(
      WinstonModule.createLogger({
        format: winston.format.uncolorize(),
        transports: [
          new winston.transports.Console({
            format: winston.format.combine(
              winston.format.timestamp(),
              winston.format.ms(),
              nestWinstonModuleUtilities.format.nestLike(),
            ),
          }),
          new WinstonCloudWatch({
            name: 'Cloudwatch Logs',
            logGroupName: configService.get('CLOUDWATCH_GROUP_NAME'),
            logStreamName: configService.get('CLOUDWATCH_STREAM_NAME'),
            awsAccessKeyId: configService.get('AWS_ACCESS_KEY'),
            awsSecretKey: configService.get('AWS_KEY_SECRET'),
            awsRegion: configService.get('CLOUDWATCH_AWS_REGION'),
            messageFormatter: function (item) {
              return (
                item.level + ': ' + item.message + ' ' + JSON.stringify(item.meta)
              );
            },
          }),
        ],
      }),
    );
  }

  await app.listen(process.env.PORT || 3000, '0.0.0.0')

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
