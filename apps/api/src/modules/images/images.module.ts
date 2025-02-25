import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule } from '@nestjs/config'
import { Module, HttpModule, forwardRef } from '@nestjs/common'
import { ImagesService } from './images.service'
import { ImagesController } from './images.controller'
import { Image } from './entities/image.entity'

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([Image]), ConfigModule],
  controllers: [ImagesController],
  providers: [ImagesService],
  exports: [TypeOrmModule.forFeature([Image]), ImagesService]
})
export class ImagesModule {}
