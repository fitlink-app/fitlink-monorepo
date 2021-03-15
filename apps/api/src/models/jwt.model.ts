type JWTToken = {
  aud: string
  iss: string
  sub: string
  iat: number
}

export type JWTAccessToken = JWTToken & {
  roles: JWTRoles
}

export type JWTIdToken = JWTToken & {
  roles: JWTRoles
  email: string
}

export type JWTRefreshToken = JWTToken & {
  refresh_token: string
}

export type JWTRoles = {
  /** Team admin */
  t_a: string[]

  /** Org admin */
  o_a: string[]

  /** Super admin */
  s_a: boolean
}
