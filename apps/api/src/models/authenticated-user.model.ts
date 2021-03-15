export type AuthenticatedUser = {
  id: string
  roles: Roles
}

export type Roles = {
  team_admin: string[]
  org_admin: string[]
  super_admin: boolean
}
