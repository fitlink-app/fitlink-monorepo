import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import {
  FastifyAdapter,
  NestFastifyApplication
} from '@nestjs/platform-fastify'
import { ApiModule } from './api.module'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'

declare const module: any

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    ApiModule,
    new FastifyAdapter()
  )
  app.setGlobalPrefix('api/v1')

  const config = new DocumentBuilder()
    .setTitle('Fitlink API')
    .setDescription('The Fitlink API on Nest')
    .setVersion('1.0')
    .addTag('fitlink')
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api/v1', app, document)

  app.useGlobalPipes(new ValidationPipe())
  await app.listen(process.env.PORT || 3000)

  if (module.hot) {
    module.hot.accept()
    module.hot.dispose(() => app.close())
  }
}

bootstrap()
