import { JwtService } from '@nestjs/jwt'
import { JWTRoles } from '../../src/models'

const jwtService = new JwtService({
  secret: 'fitlink_jwt_secret',
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

  return jwtService.sign(payload)
}

export function getAuthHeaders(
  roles: Partial<JWTRoles> = null,
  userId = 'get_auth_headers_user_id'
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
    Authorization: `Bearer ${token}`
  }
}
