export type LeagueInvitationJWT = {
  aud: 'fitlinkapp.com'
  iss: 'fitlinkapp.com'
  sub: string
  iat: number
  type: 'league-invitation'
}
