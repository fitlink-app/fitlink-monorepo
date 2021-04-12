import { HttpModule, Module } from '@nestjs/common'
import { GoalsEntriesService } from './goals-entries.service'
import { GoalsEntriesController } from './goals-entries.controller'
import { AuthModule } from '../auth/auth.module'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { GoalsEntry } from './entities/goals-entry.entity'
import { UsersModule } from '../users/users.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([GoalsEntry]),
    UsersModule,
    AuthModule,
    ConfigModule,
    HttpModule
  ],
  controllers: [GoalsEntriesController],
  providers: [GoalsEntriesService],
  exports: [TypeOrmModule.forFeature([GoalsEntry]), GoalsEntriesService]
})
export class GoalsEntriesModule {}
