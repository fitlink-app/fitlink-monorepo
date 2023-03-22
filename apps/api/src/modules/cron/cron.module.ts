import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaderboardEntry } from '../leaderboard-entries/entities/leaderboard-entry.entity';
import { Leaderboard } from '../leaderboards/entities/leaderboard.entity';
import { TasksService } from './tasks.service';
import { LeaguesModule } from '../leagues/leagues.module';
import { LeagueBfitEarnings } from '../leagues/entities/bfit-earnings.entity';
import { League } from '../leagues/entities/league.entity';
import { User } from '../users/entities/user.entity';
import { WalletTransaction } from '../wallet-transactions/entities/wallet-transaction.entity';

@Module({
	imports: [
		ScheduleModule.forRoot(),
		TypeOrmModule.forFeature([
			User,
			League,
			LeagueBfitEarnings,
			WalletTransaction,
			LeaderboardEntry,
			Leaderboard,
		]),
		LeaguesModule
	],
	providers: [TasksService]
})
export class CronModule { }