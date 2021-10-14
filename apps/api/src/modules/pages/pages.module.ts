import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from '../auth/auth.module'
import { Page } from './entities/page.entity'
import { PagesController } from './pages.controller'
import { PagesService } from './pages.service'

@Module({
  imports: [TypeOrmModule.forFeature([Page]), AuthModule, ConfigModule],
  controllers: [PagesController],
  providers: [PagesService],
  exports: []
})
export class PagesModule {}
