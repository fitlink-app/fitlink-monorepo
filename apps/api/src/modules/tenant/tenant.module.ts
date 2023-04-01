import { Module, NestModule, MiddlewareConsumer, Scope, } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tenant } from './tenant.entity';
import { TenantService } from './tenant.service';
import { TenantMiddleware } from './tenant.middleware';
import { REQUEST } from '@nestjs/core';
import { Connection, ConnectionManager, ConnectionOptions, createConnection, getConnection } from 'typeorm';
import { CLIENT_ID } from '../client-id/client-id';
import { join } from 'path';
import { Activity } from '../activities/entities/activity.entity';
import { AuthProvider } from '../auth/entities/auth-provider.entity';
import { RefreshToken } from '../auth/entities/auth.entity';
import { FeedItemLike } from '../feed-items/entities/feed-item-like.entity';
import { FeedItem } from '../feed-items/entities/feed-item.entity';
import { Following } from '../followings/entities/following.entity';
import { GoalsEntry } from '../goals-entries/entities/goals-entry.entity';
import { HealthActivityDebug } from '../health-activities/entities/health-activity-debug.entity';
import { HealthActivity } from '../health-activities/entities/health-activity.entity';
import { LeaderboardEntry } from '../leaderboard-entries/entities/leaderboard-entry.entity';
import { Leaderboard } from '../leaderboards/entities/leaderboard.entity';
import { LeaguesInvitation } from '../leagues-invitations/entities/leagues-invitation.entity';
import { LeagueBfitClaim } from '../leagues/entities/bfit-claim.entity';
import { LeagueBfitEarnings } from '../leagues/entities/bfit-earnings.entity';
import { LeagueWaitlistUser } from '../leagues/entities/league-waitlist-user.entity';
import { League } from '../leagues/entities/league.entity';
import { OrganisationsInvitation } from '../organisations-invitations/entities/organisations-invitation.entity';
import { Organisation } from '../organisations/entities/organisation.entity';
import { Page } from '../pages/entities/page.entity';
import { Queueable } from '../queue/entities/queueable.entity';
import { RewardsRedemption } from '../rewards-redemptions/entities/rewards-redemption.entity';
import { Reward } from '../rewards/entities/reward.entity';
import { Sport } from '../sports/entities/sport.entity';
import { SubscriptionsInvitation } from '../subscriptions/entities/subscriptions-invitation.entity';
import { Subscription } from '../subscriptions/entities/subscription.entity';
import { TeamsInvitation } from '../teams-invitations/entities/teams-invitation.entity';
import { Team } from '../teams/entities/team.entity';
import { UserRole } from '../user-roles/entities/user-role.entity';
import { UsersSetting } from '../users-settings/entities/users-setting.entity';
import { User } from '../users/entities/user.entity';
import { Provider } from '../providers/entities/provider.entity';
import { Image } from '../images/entities/image.entity';
import { Notification } from '../notifications/entities/notification.entity';
import { WalletTransaction } from '../wallet-transactions/entities/wallet-transaction.entity';
import { createTenantRepositoryProviders } from './tenant-service.decorator';

export const TENANT_CONNECTION = 'TENANT_CONNECTION';

const TenantFactory = {
	provide: TENANT_CONNECTION,
	inject: [
		REQUEST,
		Connection,
	],
	scope: Scope.REQUEST,
	useFactory: async (request, connection) => {
		const tenant: Tenant = await connection.getRepository(Tenant).findOne(({ where: { name: request.headers[CLIENT_ID] } }));
		try {
			return getConnection(tenant.name);

		} catch (e) {
			return await createConnection({
				name: tenant.name,
				type: 'postgres',
				host: tenant.host,
				port: tenant.port,
				username: tenant.username,
				password: tenant.password,
				database: tenant.database,
				"entities": [
					Activity,
					AuthProvider,
					Following,
					FeedItem,
					FeedItemLike,
					HealthActivity,
					HealthActivityDebug,
					GoalsEntry,
					Image,
					WalletTransaction,
					Leaderboard,
					LeaderboardEntry,
					League,
					LeaguesInvitation,
					Organisation,
					OrganisationsInvitation,
					Page,
					Provider,
					Queueable,
					RefreshToken,
					Reward,
					RewardsRedemption,
					Sport,
					Subscription,
					SubscriptionsInvitation,
					Team,
					TeamsInvitation,
					User,
					UserRole,
					UsersSetting,
					Notification,
					LeagueBfitClaim,
					LeagueBfitEarnings,
					LeagueWaitlistUser,
					Tenant
				],
				"migrations": [
					join(__dirname, "../../../database/migrations/**/*.ts")
				],
				synchronize: true,
			})
		}
	}
}

@Module({
	imports: [TypeOrmModule.forFeature([Tenant])],
	providers: [
		TenantFactory,
		TenantService,
		...createTenantRepositoryProviders()
	],
	exports: [TenantService, TENANT_CONNECTION, ...createTenantRepositoryProviders()],
})
export class TenantModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer
			.apply(TenantMiddleware)
			.forRoutes('(.*?)');
	}
}
