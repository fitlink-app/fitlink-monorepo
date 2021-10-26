import httpProxy, { ProxyResCallback } from 'http-proxy'
import Cookies from 'cookies'
import url from 'url'
import { NextApiRequest, NextApiResponse } from 'next'
import { timeout } from '../../helpers/timeout'
import { IncomingMessage, ServerResponse } from 'http'

/**
 * Based on https://maxschmitt.me/posts/next-js-http-only-cookie-auth-tokens/
 * Technique to prevent JWTs from being exposed to JavaScript in the browser,
 * which protects from malicious NPM packages, etc.
 *
 * With this solution LocalStorage is never used.
 */

// API_BASE_URL should be configured in Vercel
const API_URL = process.env.API_BASE_URL || 'http://localhost:3000'

const proxy = httpProxy.createProxyServer()
// You can export a config variable from any API route in Next.js.
// We'll use this to disable the bodyParser, otherwise Next.js
// would read and parse the entire request body before we
// can forward the request to the API. By skipping the bodyParser,
// we can just stream all requests through to the actual API.
export const config = {
  api: {
    bodyParser: false
  }
}

export default (req: NextApiRequest, res: NextApiResponse) => {
  // Return a Promise to let Next.js know when we're done
  // processing the request:
  return new Promise<void>(async (resolve, reject) => {
    // In case the current API request is for logging in,
    // we'll need to intercept the API response.
    // More on that in a bit.
    const pathname = url.parse(req.url).pathname
    const isLogin =
      pathname === '/api/v1/auth/login' ||
      pathname === '/api/v1/auth/switch' ||
      pathname === '/api/v1/auth/connect'

    const isLogout = pathname === '/api/v1/auth/logout'

    const isSignup =
      pathname === '/api/v1/auth/signup' ||
      pathname === '/api/v1/auth/organisation'

    // Get the `auth-token` cookie:
    const cookies = new Cookies(req, res)
    const authToken = cookies.get('auth-token')
    // Rewrite the URL: strip out the leading '/api'.
    // For example, '/api/login' would become '/login'.
    // ️You might want to adjust this depending
    // on the base path of your API.
    // req.url = req.url.replace(/^\/api/, '')
    // Set auth-token header from cookie:
    // Don't forward cookies to the API:
    if (authToken) {
      req.headers['auth-token'] = authToken
    }
    req.headers.cookie = ''

    const interceptLoginOrSignupResponse: ProxyResCallback = (
      proxyRes,
      interceptReq,
      interceptRes
    ) => {
      // Read the API's response body from
      // the stream:
      let apiResponseBody = ''
      proxyRes.on('data', (chunk) => {
        apiResponseBody += chunk
      })

      // Once we've read the entire API
      // response body, we're ready to
      // handle it:
      proxyRes.on('end', async () => {
        try {
          // Extract the authToken from API's response:
          const json = JSON.parse(apiResponseBody)
          let { access_token, auth } = json
          // Set the authToken as an HTTP-only cookie.
          // We'll also set the SameSite attribute to
          // 'lax' for some additional CSRF protection.
          if (!access_token && auth) {
            access_token = auth.access_token
          }

          if (access_token) {
            const cookies = new Cookies(interceptReq, interceptRes)
            cookies.set('auth-token', access_token, {
              httpOnly: true,
              sameSite: 'lax'
            })
            // Our response to the client won't contain
            // the actual authToken. This way the auth token
            // never gets exposed to the client.
            res.status(proxyRes.statusCode).json({ loggedIn: true })
            resolve()
          } else {
            res.status(proxyRes.statusCode).json(json)
            resolve()
          }
        } catch (err) {
          reject(err)
        }
      })
    }

    const interceptLogoutResponse: ProxyResCallback = (
      proxyRes,
      interceptReq,
      interceptRes
    ) => {
      let apiResponseBody = ''
      proxyRes.on('data', (chunk) => {
        apiResponseBody += chunk
      })

      proxyRes.on('end', () => {
        const cookies = new Cookies(interceptReq, interceptRes)
        cookies.set('auth-token', null, {
          httpOnly: true,
          sameSite: 'lax'
        })
        res.status(200).json({ loggedOut: true })
      })
    }

    // In case the request is for login, we need to
    // intercept the API's response. It contains the
    // auth token that we want to strip out and set
    // as an HTTP-only cookie.interceptLoginResponse
    if (isLogin || isSignup) {
      proxy.once('proxyRes', interceptLoginOrSignupResponse)
    } else if (isLogout) {
      proxy.once('proxyRes', interceptLogoutResponse)
    }

    // Don't forget to handle errors:
    proxy.once('error', reject)

    // Forward the request to the API
    proxy.web(req, res, {
      target: API_URL,
      // Don't autoRewrite because we manually rewrite
      // the URL in the route handler.
      autoRewrite: false,
      changeOrigin: true,
      // In case we're dealing with a login request,
      // we need to tell http-proxy that we'll handle
      // the client-response ourselves (since we don't
      // want to pass along the auth token).
      selfHandleResponse: isLogin || isLogout || isSignup,
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    })
  })
}
