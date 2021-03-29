#!/bin/node

/**
 * Usage
 * node ./scripts/generate-jwt.js ./config.jwt.json user1
 * node ./scripts/generate-jwt.js ./config.jwt.json superadmin
 * node ./scripts/generate-jwt.js ./config.jwt.json teamadmin1
 *
 * Refer to the sample json file to see how to construct the mocks
 * Copy the sample or create a new version as config.jwt.json (gitignored)
 *
 * A shortcut is available (maps to config.jwt.json):
 * yarn test:generate-jwt user1
 *
 */

/* eslint-disable */
const { JwtService } = require('@nestjs/jwt')

if( process.argv.length < 3 ){
  throw "No file provided"
}

const args = process.argv.slice(2);
const file = args[0]

if(!file){
  throw "No file provided"
}

const json = require(file)

const jwtService = new JwtService({
  secret: process.env.AUTH_JWT_SECRET || 'fitlink',
  verifyOptions: {
    clockTimestamp: Date.now()
  }
})

const { payload, jwt } = createToken( json[args[1]] )

console.log('\x1b[33m%s\x1b[0m',
`
${jwt}
`
)

console.log(`Debug this JWT at:
https://jwt.io/#debugger-io?token=${jwt}`)
console.log(`
Data: ${JSON.stringify(payload)}`
)

function createToken( custom ){
  const payload = {
    ... {
      aud: 'fitlink.com',
      iss: 'fitlink.com',
      iat: new Date().getTime(),
      exp: Date.now() + 60 * 60 * 1000, // 1hr
    },
    ...custom
  }
  const jwt = jwtService.sign(payload)
  return { payload, jwt }
}
