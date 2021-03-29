export type TeamInvitationJWT = {
  aud: 'fitlinkapp.com'
  iss: 'fitlinkapp.com'
  sub: string
  iat: number
  type: 'team-invitation'
}
