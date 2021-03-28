export type TeamInvitationJWT = {
  aud: string
  iss: string
  sub: string
  iat: number
  type: 'team-invitation'
}
