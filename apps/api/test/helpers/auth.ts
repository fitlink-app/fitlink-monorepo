import { JwtService } from '@nestjs/jwt'
import { JWTRoles } from '../../src/models'
import { ClientIdType } from '../../src/modules/client-id/client-id.constant'
import { CLIENT_ID } from '../../src/modules/client-id/client-id'

const jwtService = new JwtService({
  secret: process.env.AUTH_JWT_SECRET,
  verifyOptions: {
    clockTimestamp: Date.now()
  }
})

/**
 * Creates a token with valid payload on a particular
 * user id
 *
 * Roles can also be assigned: { o_a: [], t_a: [], s_a: [], spr: true }
 *
 * @param user
 * @param roles
 * @returns
 */
export function createTokenFor(userId: string, roles?: JWTRoles) {
  const payload = {
    aud: 'fitlink.com',
    iss: 'fitlink.com',
    sub: userId,
    iat: new Date().getTime(),
    exp: Date.now() + 60 * 60 * 1000, // 1hr
    roles
  }

  return jwtService.sign(payload, {secret: process.env.AUTH_JWT_SECRET})
}

export function getAuthHeaders(
  roles: Partial<JWTRoles> = null,
  userId = 'no_auth_headers_test_in_test',
  clientId: ClientIdType = 'Fitlink'
) {
  const token = createTokenFor(userId, {
    ...{
      o_a: [],
      t_a: [],
      s_a: [],
      spr: false
    },
    ...roles
  })
  return {
    Authorization: `Bearer ${token}`,
    [CLIENT_ID]: clientId
  }
}

export function createTokenFromPayload(payload: any) {
  return jwtService.sign(payload)
}
