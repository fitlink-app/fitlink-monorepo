/**
 * This file is maintained manually and used for automated deployments.
 * Keep this file up to date in order for the CI to execute the handler
 * "migrate" provided by the serverless deployment.
 */
import { InitializeSchema1614887523112 } from '../database/migrations/1614887523112-InitializeSchema'
import { InitializeSchema1615794470267 } from '../database/migrations/1615794470267-InitializeSchema'
import { UpdateLeaderboardAndImages1615881109414 } from '../database/migrations/1615881109414-UpdateLeaderboardAndImages'
import { UpdateActivitiesAndImages1616321992927 } from '../database/migrations/1616321992927-UpdateActivitiesAndImages'
import { UpdateImages1616327403639 } from '../database/migrations/1616327403639-UpdateImages'
import { RolesSubscriptions1616348704248 } from '../database/migrations/1616348704248-RolesSubscriptions'
import { OrganisationInvitationsAndSubscriptions1616424880465 } from '../database/migrations/1616424880465-OrganisationInvitationsAndSubscriptions'
import { UpdateActivitySrid1616591611709 } from '../database/migrations/1616591611709-UpdateActivitySrid'
import { UpdateActivityType1616742922721 } from '../database/migrations/1616742922721-UpdateActivityType'
import { OrganisationsInvitationsUpdate1616878363853 } from '../database/migrations/1616878363853-OrganisationsInvitationsUpdate'
import { TeamsInvitationsUpdates1616935109963 } from '../database/migrations/1616935109963-TeamsInvitationsUpdates'
import { AddTeamsUpdateLeagueSport1617030200766 } from '../database/migrations/1617030200766-AddTeamsLeagues'
import { ActivitiesUpdates1617277086715 } from '../database/migrations/1617277086715-ActivitiesUpdates'
import { ActivityTsVector1617639276042 } from '../database/migrations/1617639276042-ActivityTsVector'
import { RemoveCascadesInTeams1617803214748 } from '../database/migrations/1617803214748-RemoveCascadesInTeams'
import { GoalsEntrySetDefaults1617974041018 } from '../database/migrations/1617974041018-GoalsEntrySetDefaults'
import { UpdateUserRolesEntity1618367807302 } from '../database/migrations/1618367807302-UpdateUserRolesEntity'
import { ActivitiesTelEmail1619175623838 } from '../database/migrations/1619175623838-ActivitiesTelEmail'
import { CreateQueueable1618386283282 } from '../database/migrations/1618386283282-CreateQueueable'
import { AddUserToActivities1622016153101 } from '../database/migrations/1622016153101-AddUserToActivities'
import { UpdateHealthActivityAndImageEntity1623144653510 } from '../database/migrations/1623144653510-UpdateHealthActivityAndImageEntity'
import { CaloriesTypeFloat1623220634432 } from '../database/migrations/1623220634432-CaloriesTypeFloat'
import { UpatedProviderRelationshipAndSportRelationShip1623225545622 } from '../database/migrations/1623225545622-UpatedProviderRelationshipAndSportRelationShip'
import { UpdateUserNamePassword1623652934525 } from '../database/migrations/1623652934525-UpdateUserNamePassword'
import { UpdateGoalTypes1623699931634 } from '../database/migrations/1623699931634-UpdateGoalTypes'
import { SimplifyGoalsDates1623703853664 } from '../database/migrations/1623703853664-SimplifyGoalsDates'
import { AddUserFollowersTotal1623748154107 } from '../database/migrations/1623748154107-AddUserFollowersTotal'
import { ImagesAddOwner1623913230113 } from '../database/migrations/1623913230113-ImagesAddOwner'
import { AddedPolylineToHealthActivities1623922917753 } from '../database/migrations/1623922917753-AddedPolylineToHealthActivities'
import { LeaguesStructureChanges1624261653546 } from '../database/migrations/1624261653546-LeaguesStructureChanges'
import { UserEmailPasswordResets1624400390377 } from '../database/migrations/1624400390377-UserEmailPasswordResets'
import { EmailVerificationAndFollowerChanges1624535361790 } from '../database/migrations/1624535361790-EmailVerificationAndFollowerChanges'
import { AddParticipantsCountLeagues1624549177792 } from '../database/migrations/1624549177792-AddParticipantsCountLeagues'
import { RewardsUpdates1625057321096 } from '../database/migrations/1625057321096-RewardsUpdates'
import { RewardsRedemptionsUpdates1625572472206 } from '../database/migrations/1625572472206-RewardsRedemptionsUpdates'
import { LeaguesStartEndDates1625649869427 } from '../database/migrations/1625649869427-LeaguesStartEndDates'
import { PolylineNullableAndDistributedColumnAdded1625739121649 } from '../database/migrations/1625739121649-PolylineNullableAndDistributedColumnAdded'
import { AuthProvider1625759364689 } from '../database/migrations/1625759364689-AuthProvider'
import { SchemaUpdates1625941631377 } from '../database/migrations/1625941631377-SchemaUpdates'
import { UpdateFeedItems1626036318957 } from '../database/migrations/1626036318957-UpdateFeedItems'
import { FixEnums1629302813084 } from '../database/migrations/1629302813084-FixEnums'
import { AddOrganisationToActivity1629305606334 } from '../database/migrations/1629305606334-AddOrganisationToActivity'
import { RenameActivityUserToOwner1629363309660 } from '../database/migrations/1629363309660-RenameActivityUserToOwner'
import { UpdateRankTiers1629463294813 } from '../database/migrations/1629463294813-UpdateRankTiers'
import { UpdateUsersTiers1630668000965 } from '../database/migrations/1630668000965-UpdateUsersTiers'
import { InvitationsAdmin1631085397864 } from '../database/migrations/1631085397864-InvitationsAdmin'
import { InvitationsOwners1631087970817 } from '../database/migrations/1631087970817-InvitationsOwners'
import { AddUserCounts1631279600063 } from '../database/migrations/1631279600063-AddUserCounts'
import { SubscriptionsInvitations1631698836263 } from '../database/migrations/1631698836263-SubscriptionsInvitations'
import { AddBillingEmail1632294093767 } from '../database/migrations/1632294093767-AddBillingEmail'
import { AddBillingSubscriptionId1632316578136 } from '../database/migrations/1632316578136-AddBillingSubscriptionId'
import { AddTeamJoinCode1632688836338 } from '../database/migrations/1632688836338-AddTeamJoinCode'
import { AddFeedItemLikes1632753932139 } from '../database/migrations/1632753932139-AddFeedItemLikes'
import { OrganisationMode1632771719624 } from '../database/migrations/1632771719624-OrganisationMode'
import { AddPages1633257728285 } from '../database/migrations/1633257728285-AddPages'
import { DomainUnique1633275502651 } from '../database/migrations/1633275502651-DomainUnique'
import { AddNotifications1633364006103 } from '../database/migrations/1633364006103-AddNotifications'
import { AddHealthActivityTitle1633862053877 } from '../database/migrations/1633862053877-AddHealthActivityTitle'
import { AddSportsPace1633869946687 } from '../database/migrations/1633869946687-AddSportsPace'
import { AddImageUrlSport1633944959171 } from '../database/migrations/1633944959171-AddImageUrlSport'
import { AddUserMobileOS1634031981765 } from '../database/migrations/1634031981765-AddUserMobileOS'
import { AddIconSvgToSport1634129894631 } from '../database/migrations/1634129894631-AddIconSvgToSport'
import { SportIconUrl1634290863881 } from '../database/migrations/1634290863881-SportIconUrl'
import { AddGoalsNotifyDate1634470806764 } from '../database/migrations/1634470806764-AddGoalsNotifyDate'
import { AddPushSuccessBoolean1634571990161 } from '../database/migrations/1634571990161-AddPushSuccessBoolean'
import { AddGoalPercentage1634574422239 } from '../database/migrations/1634574422239-AddGoalPercentage'

export default [
  InitializeSchema1614887523112,
  InitializeSchema1615794470267,
  UpdateLeaderboardAndImages1615881109414,
  UpdateActivitiesAndImages1616321992927,
  UpdateImages1616327403639,
  RolesSubscriptions1616348704248,
  OrganisationInvitationsAndSubscriptions1616424880465,
  UpdateActivitySrid1616591611709,
  UpdateActivityType1616742922721,
  OrganisationsInvitationsUpdate1616878363853,
  TeamsInvitationsUpdates1616935109963,
  AddTeamsUpdateLeagueSport1617030200766,
  ActivitiesUpdates1617277086715,
  ActivityTsVector1617639276042,
  RemoveCascadesInTeams1617803214748,
  GoalsEntrySetDefaults1617974041018,
  UpdateUserRolesEntity1618367807302,
  CreateQueueable1618386283282,
  ActivitiesTelEmail1619175623838,
  AddUserToActivities1622016153101,
  UpdateHealthActivityAndImageEntity1623144653510,
  CaloriesTypeFloat1623220634432,
  UpatedProviderRelationshipAndSportRelationShip1623225545622,
  UpdateUserNamePassword1623652934525,
  UpdateGoalTypes1623699931634,
  SimplifyGoalsDates1623703853664,
  AddUserFollowersTotal1623748154107,
  ImagesAddOwner1623913230113,
  AddedPolylineToHealthActivities1623922917753,
  LeaguesStructureChanges1624261653546,
  UserEmailPasswordResets1624400390377,
  EmailVerificationAndFollowerChanges1624535361790,
  AddParticipantsCountLeagues1624549177792,
  RewardsUpdates1625057321096,
  RewardsRedemptionsUpdates1625572472206,
  LeaguesStartEndDates1625649869427,
  PolylineNullableAndDistributedColumnAdded1625739121649,
  AuthProvider1625759364689,
  SchemaUpdates1625941631377,
  UpdateFeedItems1626036318957,
  FixEnums1629302813084,
  AddOrganisationToActivity1629305606334,
  RenameActivityUserToOwner1629363309660,
  UpdateRankTiers1629463294813,
  UpdateUsersTiers1630668000965,
  InvitationsAdmin1631085397864,
  InvitationsOwners1631087970817,
  AddUserCounts1631279600063,
  SubscriptionsInvitations1631698836263,
  AddBillingEmail1632294093767,
  AddBillingSubscriptionId1632316578136,
  AddTeamJoinCode1632688836338,
  AddFeedItemLikes1632753932139,
  OrganisationMode1632771719624,
  AddPages1633257728285,
  DomainUnique1633275502651,
  AddNotifications1633364006103,
  AddHealthActivityTitle1633862053877,
  AddSportsPace1633869946687,
  AddImageUrlSport1633944959171,
  AddUserMobileOS1634031981765,
  AddIconSvgToSport1634129894631,
  SportIconUrl1634290863881,
  AddGoalsNotifyDate1634470806764,
  AddPushSuccessBoolean1634571990161,
  AddGoalPercentage1634574422239
]
