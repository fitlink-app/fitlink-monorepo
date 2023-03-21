import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaderboardEntry } from '../leaderboard-entries/entities/leaderboard-entry.entity';
import { Leaderboard } from '../leaderboards/entities/leaderboard.entity';
import { TasksService } from './tasks.service';

@Module({
	imports: [
		ScheduleModule.forRoot(),
		TypeOrmModule.forFeature([
			LeaderboardEntry,
			Leaderboard,
		]),
	],
	providers: [TasksService]
})
export class CronModule { }