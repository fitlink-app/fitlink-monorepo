import { Module } from '@nestjs/common'
import { SportsService } from './sports.service'
import { SportsController } from './sports.controller'

@Module({
  controllers: [SportsController],
  providers: [SportsService]
})
export class SportsModule {}
