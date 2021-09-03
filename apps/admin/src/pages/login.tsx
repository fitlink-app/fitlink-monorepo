import React, { useContext, useState, useEffect } from 'react'
import Link from 'next/link'
import Input from '../components/elements/Input'
import Logo from '../components/elements/Logo'
import Login from '../components/layouts/Login'
import Feedback from '../components/elements/Feedback'
import IconArrowRight from '../components/icons/IconArrowRight'
import IconApple from '../components/icons/IconApple'
import IconGoogle from '../components/icons/IconGoogle'
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
import { useRouter } from 'next/router'

const LoginPage = () => {
  const [loading, setLoading] = useState(false)
  const [errorMessage, setError] = useState('')
  const router = useRouter()

  const { user, login, primary } = useContext(AuthContext)

  const {
    mutate,
    isError,
    isSuccess,
    error,
    data
  }: ApiMutationResult<AuthResultDto> = useMutation((emailPass: AuthLoginDto) =>
    login(emailPass)
  )

  const handleLogin = (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    mutate({
      email: e.target.elements.email.value,
      password: e.target.elements.password.defaultValue
    })
  }

  useEffect(() => {
    if (error) {
      setLoading(false)
      setError(getErrorMessage(error))
    }

    if (isSuccess) {
      router.push('/start')
    }
  }, [error, isSuccess])

  return (
    <Login title="Login">
      <div className="text-center">
        <Logo height={32} />
        <h1 className="h6 mt-2 color-grey">Manage your Fitlink team</h1>
      </div>
      <form onSubmit={handleLogin} className="mt-2">
        <Input label="E-mail address" name="email" type="email" inline={true} />
        <Input label="Password" name="password" type="password" inline={true} />

        {errorMessage !== '' && (
          <Feedback
            type="error"
            className="mt-2 text-center"
            message={errorMessage}
          />
        )}
        <div className="row ai-c mt-2">
          <div className="col">
            <Link href="/demo/forgot-password">
              <a className="small-link inline-block">
                Forgot password
                <IconArrowRight />
              </a>
            </Link>
          </div>
          <div className="col text-right">
            <button className="button" disabled={loading}>
              Login with e-mail
            </button>
          </div>
        </div>
      </form>

      <div className="text-center">
        <div className="or">Or</div>
        <AppleLogin />
        <GoogleLogin />
      </div>
    </Login>
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
        <button className="button alt block" onClick={signIn}>
          <IconGoogle className="mr-1" />
          Login with Google
        </button>
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
      const appleId = (window as any).AppleID
      if (appleId) {
        appleId.auth.init({
          clientId: appleClientId,
          scope: 'name email',
          redirectURI: location.origin + '/login',
          state: '[STATE]',
          nonce: '[NONCE]',
          usePopup: true //or false defaults to false
        })
      }
    }
  }, [])

  async function signIn() {
    const data = await (window as any).AppleID.auth.signIn()
    mutate(data.authorization.code)
  }

  const appleClientId = process.env.NEXT_PUBLIC_APPLE_CLIENT_ID

  // Gracefully fail and show message
  // In case of configuration issues, other login methods
  // are still rendered
  if (!appleClientId) {
    return <div>Apple client not available</div>
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
        <button className="button alt block mb-1" onClick={signIn}>
          <IconApple className="mr-1" />
          Login with Apple
        </button>
      )}
    </>
  )
}

export default LoginPage
