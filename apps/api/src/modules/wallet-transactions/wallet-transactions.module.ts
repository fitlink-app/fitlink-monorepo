import { HttpModule, HttpService, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from '../auth/auth.module'
import { User } from '../users/entities/user.entity'
import { FeedItemsModule } from '../feed-items/feed-items.module'
import { CommonModule } from '../common/common.module'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { League } from '../leagues/entities/league.entity'
import { LeagueBfitClaim } from '../leagues/entities/bfit-claim.entity'
import { LeagueBfitEarnings } from '../leagues/entities/bfit-earnings.entity'
import { WalletTransaction } from './entities/wallet-transaction.entity'
import { WalletTransactionsService } from './wallet-transactions.service'
import { WalletTransactionsController } from './wallet-transactions.controller'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      League,
      LeagueBfitClaim,
      LeagueBfitEarnings,
      WalletTransaction,
      User
    ]),
    CommonModule,
    AuthModule,
    FeedItemsModule,
    EventEmitter2,
    HttpModule
  ],
  controllers: [WalletTransactionsController],
  providers: [WalletTransactionsService],
  exports: []
})
export class WalletTransactionsModule {}
