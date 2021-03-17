import { Module } from '@nestjs/common'
import { SportsService } from './sports.service'
import { SportsController } from './sports.controller'
import { Sport } from './entities/sport.entity'
import { TypeOrmModule } from '@nestjs/typeorm'

@Module({
  imports: [TypeOrmModule.forFeature([Sport])],
  controllers: [SportsController],
  providers: [SportsService]
})
export class SportsModule {}
