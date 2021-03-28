export type OrganisationInvitationJWT = {
  aud: string
  iss: string
  sub: string
  iat: number
  type: 'organisation-invitation'
}
