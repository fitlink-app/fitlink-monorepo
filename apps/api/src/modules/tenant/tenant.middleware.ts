import { BadRequestException, Injectable, NestMiddleware } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection, createConnection, getConnection } from 'typeorm';
import { TenantService } from './tenant.service';
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
import { Subscription } from '../subscriptions/entities/subscription.entity';
import { SubscriptionsInvitation } from '../subscriptions/entities/subscriptions-invitation.entity';
import { TeamsInvitation } from '../teams-invitations/entities/teams-invitation.entity';
import { Team } from '../teams/entities/team.entity';
import { UserRole } from '../user-roles/entities/user-role.entity';
import { UsersSetting } from '../users-settings/entities/users-setting.entity';
import { User } from '../users/entities/user.entity';
import { Tenant } from './tenant.entity';
import { Provider } from '../providers/entities/provider.entity';
import { Image } from '../images/entities/image.entity';
import { Notification } from '../notifications/entities/notification.entity';
import { WalletTransaction } from '../wallet-transactions/entities/wallet-transaction.entity';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
	constructor(
		@InjectConnection()
		private readonly connection: Connection,
		private readonly tenantService: TenantService,
	) { }

	async use(req: any, res: any, next: () => void) {
		const tenantId = req.headers[CLIENT_ID];
		const tenant = await this.tenantService.findByClient(tenantId);

		if (!tenant) {
			throw new Error(`Tenant not found with id ${tenantId}`);
		}
		try {
			getConnection(tenant.name);
			next();
		} catch (e) {

			const createdConnection: Connection = await createConnection({
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
					WalletTransaction,
					Following,
					FeedItem,
					FeedItemLike,
					HealthActivity,
					HealthActivityDebug,
					GoalsEntry,
					Image,
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

			if (createdConnection) {
				next();
			} else {
				throw new BadRequestException(
					'Database Connection Error',
					'There is a Error with the Database!',
				);
			}
		}
	}
}
