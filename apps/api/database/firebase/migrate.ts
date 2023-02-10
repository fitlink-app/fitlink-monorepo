import { Connection, Repository } from 'typeorm'
import { User } from '../../src/modules/users/entities/user.entity'
import { UnitSystem, UserRank } from '../../src/modules/users/users.constants'
import * as admin from 'firebase-admin'
import { firestore, credential } from 'firebase-admin'
import { NestFactory } from '@nestjs/core'
import { Image } from '../../src/modules/images/entities/image.entity'
import { ImageType } from '../../src/modules/images/images.constants'
import { MigrationModule } from './migration.module'
import { ImagesService } from '../../src/modules/images/images.service'
import { readFile } from 'fs/promises'
import { UsersService } from '../../src/modules/users/users.service'
import { v4 as uuid } from 'uuid'
import { UsersSetting } from '../../src/modules/users-settings/entities/users-setting.entity'
import { PrivacySetting } from '../../src/modules/users-settings/users-settings.constants'
import { AuthProvider } from '../../src/modules/auth/entities/auth-provider.entity'
import { AuthProviderType } from '../../src/modules/auth/auth.constants'
import { Team } from '../../src/modules/teams/entities/team.entity'
import { Organisation } from '../../src/modules/organisations/entities/organisation.entity'
import { Subscription } from '../../src/modules/subscriptions/entities/subscription.entity'
import {
    BillingPlanStatus,
    SubscriptionType
} from '../../src/modules/subscriptions/subscriptions.constants'
import { Reward } from '../../src/modules/rewards/entities/reward.entity'
import { RewardAccess } from '../../src/modules/rewards/rewards.constants'
import { LegacyReward, LegacyTeam, LegacyUser } from './types'
import { Goals, LegacyUserDocument } from './models/user'
import {
    LegacyLeague,
    LegacyLeaderboardEntry,
    LegacyLeaderboard
} from './models/league'
import { HttpService } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { GoalsEntry } from '../../src/modules/goals-entries/entities/goals-entry.entity'
import { League } from '../../src/modules/leagues/entities/league.entity'
import {
    LeagueAccess,
    LeagueInvitePermission
} from '../../src/modules/leagues/leagues.constants'
import { FirebaseMigration } from '../../src/modules/firebase/entities/firebase.entity'
import { Leaderboard } from '../../src/modules/leaderboards/entities/leaderboard.entity'
import { LeaderboardEntry } from '../../src/modules/leaderboard-entries/entities/leaderboard-entry.entity'
import { Following } from '../../src/modules/followings/entities/following.entity'
import { RewardsRedemption } from '../../src/modules/rewards-redemptions/entities/rewards-redemption.entity'
import * as chalk from 'chalk'
import { HealthActivity } from '../../src/modules/health-activities/entities/health-activity.entity'
import { LegacyFeedItem, LegacyHealthActivity } from './models'
import { LegacyGoal } from './models/goal'
import { Sport } from '../../src/modules/sports/entities/sport.entity'
import { Provider } from '../../src/modules/providers/entities/provider.entity'
import { FeedItem } from '../../src/modules/feed-items/entities/feed-item.entity'
import {
    FeedGoalType,
    FeedItemCategory,
    FeedItemType
} from '../../src/modules/feed-items/feed-items.constants'
import { Activity } from '../../src/modules/activities/entities/activity.entity'
import { ActivityType } from '../../src/modules/activities/activities.constants'
import { HealthActivitiesService } from '../../src/modules/health-activities/health-activities.service'
import { GoalsEntriesService } from '../../src/modules/goals-entries/goals-entries.service'

// FITLINK
const FITLINK_TEAM = 'ZxSZdl3lafZiiWiZnhlw'

// DATA SANITIZATION
// Items in the trusted list will not be sanitized
// This is to prevent accidental push notification sending / email sending during testing
// Once we are ready to fully migrate production data, it will be done without sanitization
const allow = Object.values(require('./trusted.json'))

    // BEFORE YOU RUN:
    // In testing, all tables should be truncated before running this
    // You can either manually truncate tables using TRUNCATE CASCADE
    // or destroy/recreate the docker containers using:
    // `docker compose down --volumes`
    // `docker compose up -d`

    // 1. Make sure you have saved a file credential.json to this folder (Firebase credentials)
    // 2. Updated trusted.json with your user id if it's not there (the user from Firebase)
    // 3. You need the latest export of users from the Firebase repository, saved in this directory as users.json
    // 4. Make sure migrations are up to date: `yarn run migration:run`
    // 5. Make sure sport seed has run (for health activities mapping): `yarn run migration:seed --seed CreateSports`
    // 6. Now you can run: `yarn firebase:migration`

    // NOTE! that this interacts with the Firestore production database and reads every single relevant document.
    // Avoid running this script excessively as it may incur additional costs over time.

    ; (async function run() {
        const module = await NestFactory.createApplicationContext(MigrationModule)
        const connection = module.get(Connection)
        const usersService = module.get(UsersService)
        const httpService = module.get(HttpService)
        const healthActivitiesService = module.get(HealthActivitiesService)
        const goalsService = module.get(GoalsEntriesService)

        if ((await connection.getRepository(Sport).count()) === 0) {
            throw new Error('Sports must be seeded first.')
        }

        const app = admin.initializeApp({
            storageBucket: 'fitlink-rn.appspot.com',
            credential: credential.cert(require('./credential.json'))
        })

        const fTeam = (
            await app.firestore().collection('teams').doc(FITLINK_TEAM).get()
        ).data() as LegacyTeam
        const fRewards = (await app.firestore().collection('rewards').get()).docs.map(
            (each) => {
                return {
                    ...each.data(),
                    id: each.id
                } as LegacyReward
            }
        )
        const fLeagues = (await app.firestore().collection('leagues').get()).docs.map(
            (each) => {
                return {
                    ...each.data(),
                    id: each.id
                } as LegacyLeague
            }
        )
        const fUsers = (
            JSON.parse((await readFile(__dirname + '/users.json')).toString())
                .users as LegacyUser[]
        ).filter(
            (e) => (!e.photoUrl || e.photoUrl.indexOf('robohash') === -1) && e.email
        )

        connection.manager.transaction(async (manager) => {
            /**
             * 1. Migrate user [x]
             * 1.1. Migrate user settings [x]
             * 1.2. Migrate user provider (e.g. Google / Apple) [x]
             * 1.3. Migrate user avatar [x]
             * 1.4. Migrate feed items [x]
             * 1.5. Migrate health activities [x]
             * 1.6. migrate goal entries [x]
             * 2. Migrate organisations (teams) [x]
             * 2.1. Create teams (default team) [x]
             * 2.2. Create subscriptions (default free for Fitlink) [x]
             * 3. Migrate public leagues [x]
             * 3.1 Migrate team leagues [x]
             * 3.2 Migrate league leaderboards [x]
             * 3.3 Migrate league leaderboard entries [x]
             * 4. Migrate activities (already available in codebase)
             * 5. Migrate followers [x]
             * 6. Migrate rewards [x]
             * 6.1. Migrate rewards redeemed [x]
             * 7.
             */
            const firebaseRepository = manager.getRepository(FirebaseMigration)
            const teamRepository = manager.getRepository(Team)
            const subscriptionRepository = manager.getRepository(Subscription)
            const rewardsRepository = manager.getRepository(Reward)
            const redeemRepository = manager.getRepository(RewardsRedemption)
            const leaguesRepository = manager.getRepository(League)
            const organisationRepository = manager.getRepository(Organisation)
            const usersRepository = manager.getRepository(User)
            const authProviderRepository = manager.getRepository(AuthProvider)
            const userSettingsRepository = manager.getRepository(UsersSetting)
            const leaderboardRepository = manager.getRepository(Leaderboard)
            const leaderboardEntryRepository = manager.getRepository(LeaderboardEntry)
            const followingRepository = manager.getRepository(Following)
            const healthRepository = manager.getRepository(HealthActivity)
            const sportRepository = manager.getRepository(Sport)
            const providerRepository = manager.getRepository(Provider)
            const feedItemRepository = manager.getRepository(FeedItem)

            const imageService = makeImageService()

            console.log(chalk.green('Migrating organisations...'))
            const organisation = await migrateOrganisations(organisationRepository)

            console.log(chalk.green('Migrating subscriptions...'))
            const subscription = await migrateSubscriptions(subscriptionRepository)

            console.log(chalk.green('Migrating teams...'))
            const team = await migrateTeams(teamRepository)

            console.log(chalk.green('Migrating users...'))
            const usersMixed = await migrateUsers(
                usersRepository,
                authProviderRepository,
                userSettingsRepository
            )

            console.log(chalk.green('Migrating followings...'))
            await migrateFollowings(followingRepository, usersMixed)

            console.log(chalk.green('Migrating rewards...'))
            await migrateRewards(rewardsRepository, usersMixed)

            console.log(chalk.green('Migrating leagues...'))
            await migrateLeagues(leaguesRepository)

            console.log(chalk.green('Migrating feed items...'))
            await migrateFeed(feedItemRepository, usersMixed)

            console.log(chalk.green('Migrating activities...'))
            await migrateActivities()

            async function migrateOrganisations(repo: Repository<Organisation>) {
                return await repo.save(
                    repo.create({
                        timezone: fTeam.timezone,
                        name: 'Fitlink',
                        avatar: await imageService.createOneFromUrl(
                            fTeam.photo_url,
                            ImageType.Avatar,
                            {
                                alt: fTeam.company
                            }
                        )
                    })
                )
            }

            /**
             * No subscriptions existed in the previous
             * Firestore db, and only one is needed for the default "Fitlink"
             * team.
             *
             * @param repo
             * @returns
             */
            async function migrateSubscriptions(repo: Repository<Subscription>) {
                // CREATE DEFAULT SUBSCRIPTION
                return repo.save(
                    repo.create({
                        billing_address_1: fTeam.billing_address.line1,
                        billing_address_2: fTeam.billing_address.line2,
                        billing_city: fTeam.billing_address.city,
                        billing_state: fTeam.billing_address.state,
                        billing_country: fTeam.billing_address.country,
                        billing_postcode: fTeam.billing_address.zip,
                        billing_country_code: 'GB',
                        billing_entity: 'Fitness Tech Group Ltd',
                        billing_first_name: fTeam.billing_first_name,
                        billing_last_name: fTeam.billing_last_name,
                        billing_plan_customer_id: fTeam.billing_subscription.customer_id,
                        billing_plan_trial_end_date:
                            fTeam.billing_subscription.trial_end.toDate(),
                        organisation,
                        subscription_starts_at: fTeam.billing_subscription.trial_end.toDate(),
                        type: SubscriptionType.Free,
                        billing_plan_status: BillingPlanStatus.Canceled,
                        billing_plan_last_billed_month: fTeam.last_billed_month,
                        default: true
                    })
                )
            }

            /**
             * Only 1 team is necessary to migrate
             * which is the "Fitlink" team.
             *
             * @param repo
             * @returns
             */
            async function migrateTeams(repo: Repository<Team>) {
                return await repo.save(
                    repo.create({
                        name: 'Fitlink',
                        organisation,
                        avatar: await imageService.createOneFromUrl(
                            fTeam.photo_url,
                            ImageType.Avatar,
                            {
                                alt: fTeam.company
                            }
                        )
                    })
                )
            }

            async function migrateRewards(
                repo: Repository<Reward>,
                mixed: UsersMixed[]
            ) {
                return Promise.all(
                    fRewards.map(async (reward) => {
                        const rewardSaved = await repo.save(
                            repo.create({
                                access:
                                    reward.access === 'team'
                                        ? RewardAccess.Team
                                        : RewardAccess.Public,
                                brand: reward.brand,
                                code: reward.code,
                                redeem_url: reward.redeem_url,
                                redeemed_count: reward.redeemed_count,
                                redeem_instructions: reward.redeem_instructions,
                                description: reward.description,
                                points_required: Number(reward.points_required) || 0,
                                reward_expires_at: reward.reward_expires_at
                                    ? reward.reward_expires_at.toDate()
                                    : undefined,
                                name: reward.title,
                                name_short: reward.title_short,
                                image: await imageService.createOneFromUrl(
                                    reward.photo_url,
                                    ImageType.Standard,
                                    {
                                        alt: reward.title_short
                                    }
                                ),
                                team: reward.team_id === FITLINK_TEAM ? team : undefined
                            })
                        )

                        // Saves all redemptions
                        await Promise.all(
                            mixed.map(async ({ user, data }) => {
                                data.rewards_redeemed = data.rewards_redeemed || {}
                                if (data.rewards_redeemed[reward.id]) {
                                    return redeemRepository.save(
                                        redeemRepository.create({
                                            reward: rewardSaved,
                                            user
                                        })
                                    )
                                }
                            })
                        )

                        // Save references to rewards
                        await firebaseRepository.save({
                            firebase_id: reward.id,
                            entity_id: rewardSaved.id
                        })
                    })
                )
            }

            async function migrateUsers(
                repo: Repository<User>,
                provider: Repository<AuthProvider>,
                settings: Repository<UsersSetting>
            ) {
                const goals = manager.getRepository(GoalsEntry)

                return Promise.all(
                    fUsers
                        // .filter((e) => allow.includes(e.localId))
                        .map(async (userEntry) => {
                            const id = userEntry.localId

                            const result = await app
                                .firestore()
                                .collection('users')
                                .doc(id)
                                .get()
                            const auth = await app.auth().getUser(id)
                            const data = {
                                ...result.data(),
                                id
                            } as LegacyUserDocument

                            // If it's not in the allowed list, for now we sanitize
                            // to prevent accidental email or push notification sends
                            // This will be removed in our final production migration
                            let originalEmail = userEntry.email || auth.email

                            // if (!originalEmail) {
                            //   originalEmail = id + '-safe@fitlinkapp.com'
                            // }

                            let userEmail = auth.email || originalEmail
                            let fcmTokens = data.fcmTokens || []
                            // if (allow.indexOf(id) === -1) {
                            //   userEmail = id + '-safe@fitlinkapp.com'
                            //   userEntry.email = userEmail
                            //   if (userEntry.providerUserInfo) {
                            //     userEntry.providerUserInfo = userEntry.providerUserInfo.map(
                            //       (each) => {
                            //         each.email = userEmail
                            //         return each
                            //       }
                            //     )
                            //   }
                            //   fcmTokens = []
                            // }

                            // Save core user fields
                            let user = new User()

                            if (userEntry.passwordHash) {
                                user.password =
                                    userEntry.passwordHash + '__FIREBASE__' + userEntry.salt
                            } else {
                                user.password = await usersService.hashPassword(
                                    Date.now() + uuid()
                                )
                            }

                            const userGoals = getBaseGoals(data.daily_goals)

                            user.name = data.name || auth.displayName
                            user.email = userEmail
                            user.email_verified = auth.emailVerified
                            user.points_total = data.points_total || 0
                            user.rank = (data.rank || UserRank.Tier1) as UserRank
                            user.points_week = data.points_week || 0
                            user.last_app_opened_at = toDate(data.last_app_opened_at)
                            user.last_health_activity_at = toDate(data.last_health_activity_at)
                            user.last_lifestyle_activity_at = toDate(
                                data.last_lifestyle_activity_at
                            )
                            user.last_login_at =
                                toDate(data.last_login_at) || auth.metadata.lastSignInTime
                                    ? new Date(auth.metadata.lastSignInTime)
                                    : null

                            user.created_at = userEntry.createdAt
                                ? new Date(parseInt(userEntry.createdAt))
                                : new Date()
                            user.updated_at = data.updated_at
                                ? toDate(data.updated_at)
                                : undefined

                            user.goal_floors_climbed = userGoals.floors_climbed.target
                            user.goal_mindfulness_minutes = userGoals.mindfulness.target
                            user.goal_sleep_hours = userGoals.sleep_hours.target
                            user.goal_steps = userGoals.steps.target
                            user.goal_water_litres = userGoals.water_litres.target

                            // We may want to reonboard all users at update time?
                            user.onboarded = false

                            user.timezone = data.timezone || 'Etc/UTC'
                            user.unit_system =
                                (data.unit_system as UnitSystem) || UnitSystem.Metric
                            user.fcm_tokens = (fcmTokens as string[]) || []

                            user = await usersRepository.save(usersRepository.create(user))

                            // If it's an apple relay email, this was actually a provider,
                            // although Firebase doesn't store it this way
                            if (originalEmail.indexOf('privaterelay.appleid.com') > 0) {
                                userEntry.providerUserInfo.push({
                                    providerId: AuthProviderType.Apple,
                                    email: userEntry.email
                                })
                            }

                            // Loop through providers from dataset and create new providers
                            if (
                                userEntry.providerUserInfo &&
                                userEntry.providerUserInfo.length
                            ) {
                                await Promise.all(
                                    userEntry.providerUserInfo.map((prov) => {
                                        return provider.save(
                                            provider.create({
                                                user,
                                                type: prov.providerId,
                                                email: prov.email || userEntry.email,
                                                photo_url: prov.photoUrl,
                                                display_name: prov.displayName,
                                                raw_id: prov.rawId
                                            })
                                        )
                                    })
                                )
                            }

                            // Update the users's avatar
                            if (data.photo_url) {
                                // Apply the avatar to the user entity
                                await repo.update(user.id, {
                                    avatar: await imageService.createOneFromUrl(
                                        data.photo_url,
                                        ImageType.Avatar,
                                        {
                                            owner: user,
                                            alt: user.name
                                        }
                                    )
                                })
                            }

                            // Set an empty object if not available
                            if (data.privacy_settings) {
                                // Create the user settings
                                await settings.save(
                                    settings.create({
                                        user,
                                        newsletter_subscriptions_admin:
                                            data.newsletter_subscriptions &&
                                            data.newsletter_subscriptions.admin,
                                        newsletter_subscriptions_user:
                                            data.newsletter_subscriptions &&
                                            data.newsletter_subscriptions.user,
                                        privacy_activities: getPrivacySetting(
                                            data.privacy_settings.activities
                                        ),
                                        privacy_daily_statistics: getPrivacySetting(
                                            data.privacy_settings.activities
                                        )
                                    })
                                )
                            }

                            // Save users health providers first
                            let providers: Provider[]
                            if (data.providers) {
                                providers = await Promise.all(
                                    Object.keys(data.providers).map((type) => {
                                        const provider = data.providers[type]
                                        return providerRepository.save(
                                            providerRepository.create({
                                                user,
                                                type: type,
                                                created_at: provider.created_at.toDate(),
                                                updated_at: provider.updated_at.toDate(),
                                                provider_user_id: provider.provider_user_id,
                                                refresh_token: provider.refresh_token,
                                                token: provider.token,
                                                scopes: provider.scopes,
                                                token_expires_at: provider.token_expires_at
                                                    ? new Date(provider.token_expires_at * 1000)
                                                    : undefined
                                            })
                                        )
                                    })
                                )
                            }

                            const healthActivities = (
                                await result.ref.collection('health_activities').get()
                            ).docs

                            await Promise.all(
                                healthActivities.map(async (each) => {
                                    const item = each.data() as LegacyHealthActivity
                                    const sport = await sportRepository.findOne({
                                        name_key: item.type
                                    })
                                    const provider = providers.filter((each) => {
                                        return each.type === item.provider
                                    })[0]

                                    if (sport && provider) {
                                        const healthActivity = await healthRepository.save(
                                            healthRepository.create({
                                                user,
                                                sport,
                                                provider,
                                                active_time: Math.ceil(item.active_time) || 0,
                                                calories: item.calories || 0,
                                                elevation: item.elevation,
                                                polyline: item.polyline,
                                                points: item.points,
                                                stairs: Math.ceil(item.stairs) || 0,
                                                quantity: item.quantity,
                                                start_time: item.start_time.toDate(),
                                                end_time: item.end_time.toDate(),
                                                distance: item.distance,
                                                created_at: item.created_at.toDate(),
                                                updated_at: item.updated_at.toDate(),
                                                title: healthActivitiesService.getComputedTitle(
                                                    sport.singular,
                                                    item.start_time.toDate(),
                                                    user.timezone
                                                )
                                            })
                                        )

                                        // Store a reference to the migrated health activity
                                        await firebaseRepository.save({
                                            firebase_id: each.id,
                                            entity_id: healthActivity.id
                                        })

                                        return healthActivity
                                    }
                                })
                            )

                            // Create the user's goals for the previous days
                            const dailyGoals = (
                                await result.ref.collection('daily_goals').get()
                            ).docs

                            await Promise.all(
                                dailyGoals.map(async (goal) => {
                                    const item = goal.data() as LegacyGoal

                                    // Create the user's goals object for the day
                                    const goalEntry = await goals.save(
                                        goals.create({
                                            user,
                                            created_at: item.created_at.toDate(),
                                            updated_at: item.last_updated_at.toDate(),
                                            current_floors_climbed: Math.ceil(item.floors_climbed) || 0,
                                            target_floors_climbed: userGoals.floors_climbed.target,
                                            current_mindfulness_minutes:
                                                Math.ceil(item.mindfulness) || 0,
                                            target_mindfulness_minutes: userGoals.mindfulness.target,
                                            current_sleep_hours: item.sleep_hours || 0,
                                            target_sleep_hours: userGoals.sleep_hours.target,
                                            current_steps: Math.ceil(item.steps) || 0,
                                            target_steps: userGoals.steps.target,
                                            current_water_litres: item.water_litres || 0,
                                            target_water_litres: userGoals.water_litres.target
                                        })
                                    )

                                    const feedItems = []
                                    if (
                                        goalEntry.current_floors_climbed >=
                                        goalEntry.target_floors_climbed
                                    ) {
                                        feedItems.push(FeedGoalType.FloorsClimbed)
                                    }

                                    if (
                                        goalEntry.current_mindfulness_minutes >=
                                        goalEntry.target_mindfulness_minutes
                                    ) {
                                        feedItems.push(FeedGoalType.MindfulnessMinutes)
                                    }

                                    if (goalEntry.current_steps >= goalEntry.target_steps) {
                                        feedItems.push(FeedGoalType.Steps)
                                    }

                                    if (
                                        goalEntry.current_water_litres >=
                                        goalEntry.target_water_litres
                                    ) {
                                        feedItems.push(FeedGoalType.WaterLitres)
                                    }

                                    if (
                                        goalEntry.current_sleep_hours >= goalEntry.target_sleep_hours
                                    ) {
                                        feedItems.push(FeedGoalType.SleepHours)
                                    }

                                    // Add any daily goals reached to the feed
                                    await Promise.all(
                                        feedItems.map((type) => {
                                            return feedItemRepository.save(
                                                feedItemRepository.create({
                                                    user,
                                                    goal_entry: goalEntry,
                                                    type: FeedItemType.DailyGoalReached,
                                                    category: FeedItemCategory.MyGoals,
                                                    goal_type: type,
                                                    created_at: goalEntry.created_at,
                                                    updated_at: goalEntry.updated_at,
                                                    date: goalEntry.created_at
                                                })
                                            )
                                        })
                                    )
                                })
                            )

                            // Create the user's goals object for the day
                            await goals.save(
                                goals.create({
                                    user,
                                    current_floors_climbed: userGoals.floors_climbed.current,
                                    target_floors_climbed: userGoals.floors_climbed.target,
                                    current_mindfulness_minutes: userGoals.mindfulness.current,
                                    target_mindfulness_minutes: userGoals.mindfulness.target,
                                    current_sleep_hours: userGoals.sleep_hours.current,
                                    target_sleep_hours: userGoals.sleep_hours.target,
                                    current_steps: userGoals.steps.current,
                                    target_steps: userGoals.steps.target,
                                    current_water_litres: userGoals.water_litres.current,
                                    target_water_litres: userGoals.water_litres.target
                                })
                            )

                            // Add the user to the team
                            if (data.teamIds && data.teamIds.indexOf(FITLINK_TEAM) > -1) {
                                await teamRepository
                                    .createQueryBuilder()
                                    .relation(Team, 'users')
                                    .of(team)
                                    .add(user)

                                await subscriptionRepository
                                    .createQueryBuilder()
                                    .relation(Subscription, 'users')
                                    .of(subscription)
                                    .add(user)
                            }

                            // Store a reference to the migrated user
                            await firebaseRepository.save({
                                firebase_id: data.id,
                                entity_id: user.id
                            })

                            return {
                                user,
                                data
                            }
                        })
                )
            }

            async function migrateFollowings(
                repo: Repository<Following>,
                mixed: UsersMixed[]
            ) {
                return Promise.all(
                    mixed.map(async ({ data }) => {
                        data.following = data.following || []
                        return Promise.all(
                            data.following.map((targetId) => {
                                const follower = getOne(data.id)
                                const following = getOne(targetId)
                                if (follower && following) {
                                    return repo.save(
                                        repo.create({
                                            follower,
                                            following
                                        })
                                    )
                                }
                            })
                        )
                    })
                )

                function getOne(firebaseId: string) {
                    const result = mixed.filter(({ data }) => {
                        return data.id === firebaseId
                    })
                    if (result[0]) {
                        return result[0].user
                    } else {
                        return null
                    }
                }
            }

            async function migrateLeagues(repo: Repository<League>) {
                return Promise.all(
                    fLeagues.map(async (leagueData) => {
                        let image: Image

                        // Get the creator if it exists
                        const creator = await (async function() {
                            const fb = await firebaseRepository.findOne({
                                firebase_id: leagueData.created_by
                            })
                            if (fb) {
                                return usersRepository.findOne(fb.entity_id)
                            } else {
                                return null
                            }
                        })()

                        // Process the photo if it exists
                        // TODO: Do we need a different size cover photo?
                        if (leagueData.photo_url) {
                            image = await imageService.createOneFromUrl(
                                leagueData.photo_url,
                                ImageType.Cover,
                                {
                                    alt: leagueData.title
                                }
                            )
                        }

                        // There is only one team during this migration
                        // The "Fitlink" team
                        let leagueTeam: Team
                        if (leagueData.team || leagueData.team_id) {
                            leagueTeam = team
                        }

                        const sport: Sport = await sportRepository.findOneOrFail({
                            where: {
                                name_key: leagueData.sport
                            }
                        })

                        const league = await repo.save(
                            repo.create({
                                access:
                                    (leagueData.access as unknown as LeagueAccess) ||
                                    LeagueAccess.Public,
                                created_at: leagueData.created_at.toDate(),
                                starts_at: leagueData.created_at.toDate(),
                                ends_at: leagueData.ends_at.toDate(),
                                updated_at: leagueData.updated_at.toDate(),
                                duration: leagueData.duration,
                                name: leagueData.title,
                                description: leagueData.description,
                                invite_permission: LeagueInvitePermission.Participant,
                                participants_total: leagueData.members_count,
                                repeat: leagueData.repeat,
                                image,
                                sport,
                                owner: creator,
                                team: leagueTeam
                            })
                        )

                        // Store a reference to the migrated user
                        await firebaseRepository.save({
                            firebase_id: leagueData.id,
                            entity_id: league.id
                        })

                        // Look for users that are part of the league
                        const fLeagueUsers = (
                            await app
                                .firestore()
                                .collection('users')
                                .where('leagueIds', 'array-contains', leagueData.id)
                                .get()
                        ).docs.map((doc) => {
                            return {
                                ...doc.data(),
                                id: doc.id
                            } as LegacyUserDocument
                        })

                        // Attach those users to the league
                        await Promise.all(
                            fLeagueUsers.map(async (leagueUser) => {
                                const user = await getEntityFromFirebase(
                                    usersRepository,
                                    leagueUser.id
                                )
                                if (user) {
                                    return repo
                                        .createQueryBuilder()
                                        .relation(League, 'users')
                                        .of(league)
                                        .add(user)
                                }
                            })
                        )

                        // Get the active leaderboard entry
                        const fLeaderboardDoc = app
                            .firestore()
                            .collection('leaderboards')
                            .doc(leagueData.active_leaderboard)
                        const fLeaderboard = (
                            await fLeaderboardDoc.get()
                        ).data() as LegacyLeaderboard
                        const entries = (
                            await fLeaderboardDoc.collection('leaderboard_entries').get()
                        ).docs.map((doc) => {
                            return {
                                ...doc.data()
                            } as LegacyLeaderboardEntry
                        })

                        const leaderboard = await leaderboardRepository.save(
                            leaderboardRepository.create({
                                league,
                                completed: fLeaderboard.completed
                            })
                        )

                        // Make the leaderboard the default
                        await leaguesRepository.update(league, {
                            active_leaderboard: leaderboard
                        })

                        await Promise.all(
                            entries.map(async (entry) => {
                                const user = await getEntityFromFirebase(
                                    usersRepository,
                                    entry.user_id
                                )
                                if (user) {
                                    return leaderboardEntryRepository.save(
                                        leaderboardEntryRepository.create({
                                            leaderboard,
                                            league_id: league.id,
                                            leaderboard_id: leaderboard.id,
                                            user_id: user.id,
                                            points: entry.points + entry.pending_points,
                                            wins: entry.wins,
                                            user: user,
                                            created_at: entry.created_at.toDate(),
                                            updated_at: entry.updated_at.toDate()
                                        })
                                    )
                                }
                            })
                        )
                    })
                )
            }

            async function migrateFeed(
                repo: Repository<FeedItem>,
                mixed: UsersMixed[]
            ) {
                return Promise.all(
                    mixed.map(async ({ user, data }) => {
                        const feed = await firestore()
                            .collection('users')
                            .doc(data.id)
                            .collection('feed')
                            .get()

                        await Promise.all(
                            feed.docs.map(async (each) => {
                                const item = each.data() as LegacyFeedItem
                                let league: League,
                                    health_activity: HealthActivity,
                                    related_user: User,
                                    reward: Reward

                                if (item.league && item.league.id) {
                                    league = await getEntityFromFirebase(
                                        leaguesRepository,
                                        item.league.id
                                    )
                                }

                                if (item.health_activity && item.health_activity.id) {
                                    health_activity = await getEntityFromFirebase(
                                        healthRepository,
                                        item.health_activity.id
                                    )
                                }

                                if (item.user && item.user.uid) {
                                    related_user = await getEntityFromFirebase(
                                        usersRepository,
                                        item.user.uid
                                    )
                                }

                                if (item.reward && item.reward.id) {
                                    reward = await getEntityFromFirebase(
                                        rewardsRepository,
                                        item.reward.id
                                    )
                                }

                                // Skip as it's been created already during user creation
                                if (item.goal) {
                                    return
                                }

                                return repo.save(
                                    repo.create({
                                        user,
                                        league,
                                        health_activity,
                                        reward,
                                        related_user,
                                        tier: item.tier as unknown as UserRank,
                                        type: item.type as unknown as FeedItemType,
                                        category:
                                            (item.category as unknown as FeedItemCategory) ||
                                            FeedItemCategory.MyUpdates,
                                        goal_type: item.goal as unknown as FeedGoalType,
                                        created_at: item.created_at.toDate(),
                                        updated_at: item.updated_at.toDate(),
                                        date: health_activity
                                            ? health_activity.start_time
                                            : item.created_at.toDate()
                                    })
                                )
                            })
                        )
                    })
                )
            }

            async function migrateActivities() {
                const response = await httpService
                    .get('https://api-sls.fitlinkapp.com/api/v1/activities', {
                        headers: {
                            Authorization: 'Bearer fitlinkLeaderboardEntryToken'
                        }
                    })
                    .toPromise()

                const results = response.data.results as Activity[]
                const repo = manager.getRepository(Activity)
                const imageRepo = manager.getRepository(Image)

                const output = await Promise.all(
                    results.map(
                        async ({ images, organizer_image, user_id, tsv, ...rest }) => {
                            const migratedImages = await Promise.all(
                                images.map(({ activity, ...rest }) => {
                                    return imageRepo.save(rest)
                                })
                            )

                            let owner: User
                            if (user_id) {
                                owner = await getEntityFromFirebase(usersRepository, user_id)
                            }

                            if (organizer_image) {
                                await imageRepo.save(organizer_image)
                            }

                            const activity = await repo.save(
                                repo.create({
                                    ...rest,
                                    ...{ organizer_image },
                                    owner
                                })
                            )

                            await Promise.all(
                                migratedImages.map((image) => {
                                    return imageRepo.update(image.id, { activity })
                                })
                            )

                            return activity
                        }
                    )
                )

                return output
            }

            async function getEntityFromFirebase(
                repo: Repository<any>,
                firebase_id: string
            ) {
                const fb = await firebaseRepository.findOne({ firebase_id })
                if (fb) {
                    return repo.findOne(fb.entity_id)
                }
                return null
            }

            function makeImageService() {
                return new ImagesService(
                    manager.getRepository(Image),
                    module.get(ConfigService),
                    module.get(HttpService)
                )
            }
        })
    })()

function getPrivacySetting(type: any) {
    if (type === 'followers') {
        return PrivacySetting.Following
    }

    if (type === 'private') {
        return PrivacySetting.Private
    }

    return PrivacySetting.Public
}

function toDate(timestamp: firestore.Timestamp) {
    return timestamp && timestamp.seconds ? timestamp.toDate() : null
}

function getBaseGoals(goals: Goals) {
    goals = goals || ({} as Goals)
    return {
        floors_climbed: {
            target:
                Math.ceil(goals.floors_climbed ? goals.floors_climbed.target : 0) || 0,
            current:
                Math.ceil(goals.floors_climbed ? goals.floors_climbed.current : 0) || 0
        },
        sleep_hours: {
            target: (goals.sleep_hours ? goals.sleep_hours.target : 0) || 0,
            current: (goals.sleep_hours ? goals.sleep_hours.current : 0) || 0
        },
        steps: {
            target: Math.ceil(goals.steps ? goals.steps.target : 0) || 0,
            current: Math.ceil(goals.steps ? goals.steps.current : 0) || 0
        },
        water_litres: {
            target: (goals.water_litres ? goals.water_litres.target : 0) || 0,
            current: (goals.water_litres ? goals.water_litres.current : 0) || 0
        },
        mindfulness: {
            target: Math.ceil(goals.mindfulness ? goals.mindfulness.target : 0) || 0,
            current: Math.ceil(goals.mindfulness ? goals.mindfulness.current : 0) || 0
        }
    }
}

declare global {
    namespace Storage {
        interface MultipartFile {
            toBuffer: () => Promise<Buffer>
            file: NodeJS.ReadableStream
            filepath: string
            fieldname: string
            filename: string
            encoding: string
            mimetype: string
            fields: import('fastify-multipart').MultipartFields
        }
    }
}

declare module 'fastify' {
    interface FastifyRequest {
        incomingFiles: Storage.MultipartFile[]
        incomingFile: Storage.MultipartFile
    }
}

type UsersMixed = {
    user: User
    data: LegacyUserDocument
}
