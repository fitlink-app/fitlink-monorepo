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
import { UpdateUserNamePassword1623652934525 } from '../database/migrations/1623652934525-UpdateUserNamePassword'
import { UpdateGoalTypes1623699931634 } from '../database/migrations/1623699931634-UpdateGoalTypes'

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
  UpdateUserNamePassword1623652934525,
  UpdateGoalTypes1623699931634
]
