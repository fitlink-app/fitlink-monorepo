import { Module } from '@nestjs/common'
import { GoalsEntriesService } from './goals-entries.service'
import { GoalsEntriesController } from './goals-entries.controller'

@Module({
  controllers: [GoalsEntriesController],
  providers: [GoalsEntriesService]
})
export class GoalsEntriesModule {}
