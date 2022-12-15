export type EmailResetJWT = {
  aud: 'fitlinkteams.com'
  iss: 'fitlinkteams.com'

  /** The id of the user */
  sub: string
  iat: number
  type: 'email-reset'
}
