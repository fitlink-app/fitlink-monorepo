import { Module } from '@nestjs/common'
import { SportsService } from './sports.service'
import { SportsController } from './sports.controller'
import { Sport } from './entities/sport.entity'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from '../auth/auth.module'

@Module({
  imports: [TypeOrmModule.forFeature([Sport]), AuthModule],
  controllers: [SportsController],
  providers: [SportsService]
})
export class SportsModule {}
