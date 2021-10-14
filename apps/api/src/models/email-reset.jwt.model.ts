export type EmailResetJWT = {
  aud: 'fitlinkapp.com'
  iss: 'fitlinkapp.com'

  /** The id of the user */
  sub: string
  iat: number
  type: 'email-reset'
}
