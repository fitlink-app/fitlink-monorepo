import { Roles } from '@fitlink/api/src/modules/user-roles/user-roles.constants'

export const shortDescriptions = {
  [Roles.SubscriptionAdmin]: `Subscription administrators can manage the billing for a subscription.`,
  [Roles.TeamAdmin]: `Team administrators can invite users to teams, and create leagues, rewards, and activities for the team to enjoy.`,
  [Roles.OrganisationAdmin]: `Organisation administrators can manage teams, and also create organisation-wide leagues, rewards, and activities for all teams to enjoy.`,
  [Roles.Self]: `Team members can participate in team leagues, claim rewards, and find activities.`
}
