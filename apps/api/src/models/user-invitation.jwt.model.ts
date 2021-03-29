export type UserInvitationJWT = {
  aud: 'fitlinkapp.com'
  iss: 'fitlinkapp.com'
  sub: string
  iat: number
  type: 'user-invitation'
}
