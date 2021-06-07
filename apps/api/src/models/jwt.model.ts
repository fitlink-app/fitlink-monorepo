import { ApiProperty } from '@nestjs/swagger'

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

export class JWTRoles {
  @ApiProperty()
  /** Team admin */
  t_a: string[]

  @ApiProperty()
  /** Org admin */
  o_a: string[]

  @ApiProperty()
  /** Subscription admin */
  s_a: string[]

  @ApiProperty()
  /** Super admin */
  spr: boolean
}
