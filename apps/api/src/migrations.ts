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

export default [
  InitializeSchema1614887523112,
  InitializeSchema1615794470267,
  UpdateLeaderboardAndImages1615881109414,
  UpdateActivitiesAndImages1616321992927,
  UpdateImages1616327403639,
  RolesSubscriptions1616348704248,
  OrganisationInvitationsAndSubscriptions1616424880465,
  UpdateActivitySrid1616591611709,
  UpdateActivityType1616742922721
]
