import React, { useContext, useState, useEffect } from 'react'
import Head from 'next/head'
import { AuthContext } from '../context/Auth.context'
import { useMutation } from 'react-query'
import {
  AuthLoginDto,
  AuthResultDto,
  AuthProviderType,
  AuthSignupDto
} from '@fitlink/api-sdk/types'
import { getErrorMessage } from '@fitlink/api-sdk'
import { ApiMutationResult } from '@fitlink/common/react-query/types'
import jwtDecode, { JwtPayload } from 'jwt-decode'

const Login = () => {
  const { user, login } = useContext(AuthContext)
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const {
    mutate,
    isError,
    isSuccess,
    error,
    data
  }: ApiMutationResult<AuthResultDto> = useMutation((emailPass: AuthLoginDto) =>
    login(emailPass)
  )

  return (
    <>
      <form method="post" onSubmit={(e) => e.preventDefault()}>
        {user && JSON.stringify(user)}
        {isError && getErrorMessage(error)}
        {isSuccess && JSON.stringify(jwtDecode<JwtPayload>(data.access_token))}
        <h1>Login</h1>
        <div>
          <label>Email</label>
          <input
            type="email"
            name="email"
            onChange={(e) => setEmail(e.currentTarget.value)}
          />
        </div>

        <div>
          <label>Password</label>
          <input
            type="password"
            name="password"
            onChange={(e) => setPassword(e.currentTarget.value)}
          />
        </div>

        <button
          onClick={() => {
            mutate({ email, password })
          }}>
          Login
        </button>

        <GoogleLogin />
        <AppleLogin />
      </form>
    </>
  )
}

function GoogleLogin() {
  const { connect } = useContext(AuthContext)
  const {
    mutate,
    isError,
    error,
    data
  }: ApiMutationResult<AuthSignupDto> = useMutation((token: string) =>
    connect({
      provider: AuthProviderType.Google,
      token: token
    })
  )

  useEffect(() => {
    if (typeof window != 'undefined') {
      ;(window as any).onLoad = function onLoad() {
        const gapi = (window as any).gapi
        gapi.load('auth2', function () {
          gapi.auth2.init()
        })
      }
    }
  }, [])

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

  // Gracefully fail and show message
  // In case of configuration issues, other login methods
  // are still rendered
  if (!googleClientId) {
    return <div>Google client not available</div>
  }

  async function signIn() {
    const auth2 = (window as any).gapi.auth2.getAuthInstance()
    const user = await auth2.signIn()
    mutate(user.getAuthResponse().id_token)
  }

  return (
    <>
      <Head>
        <meta name="google-signin-scope" content="profile email" />
        <meta
          name="google-signin-client_id"
          content={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}
        />
        <script
          src="https://apis.google.com/js/platform.js?onload=onLoad"
          async
          defer></script>
      </Head>
      {isError ? JSON.stringify(error.response.data.message) : ''}
      {data ? (
        JSON.stringify(data.me)
      ) : (
        <a href="#" onClick={signIn}>
          Google Sign In
        </a>
      )}
    </>
  )
}

function AppleLogin() {
  const { connect } = useContext(AuthContext)
  const {
    mutate,
    isError,
    error,
    data
  }: ApiMutationResult<AuthSignupDto> = useMutation((token: string) =>
    connect({
      provider: AuthProviderType.Apple,
      token: token
    })
  )

  useEffect(() => {
    if (typeof window != 'undefined') {
      ;(window as any).AppleID.auth.init({
        clientId: 'com.fitlinkapp-services',
        scope: 'name email',
        redirectURI: location.origin + '/login',
        state: '[STATE]',
        nonce: '[NONCE]',
        usePopup: true //or false defaults to false
      })
    }
  }, [])

  async function signIn() {
    const data = await (window as any).AppleID.auth.signIn()
    mutate(data.authorization.code)
  }

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

  // Gracefully fail and show message
  // In case of configuration issues, other login methods
  // are still rendered
  if (!googleClientId) {
    return <div>Google client not available</div>
  }

  return (
    <>
      <Head>
        <script
          type="text/javascript"
          src="https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js"></script>
      </Head>
      {isError ? JSON.stringify(error.response.data.message) : ''}
      {data ? (
        JSON.stringify(data.me)
      ) : (
        <a href="#" onClick={signIn}>
          Apple Sign in
        </a>
      )}
    </>
  )
}

export default Login
