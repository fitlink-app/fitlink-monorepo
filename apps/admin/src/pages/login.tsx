import React, { useContext, useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
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
  AuthSignupDto,
  CreateUserDto
} from '@fitlink/api-sdk/types'
import { ApiMutationResult } from '@fitlink/common/react-query/types'
import { useRouter } from 'next/router'
import useApiErrors from '../hooks/useApiErrors'
import useRedeemInvitation from '../hooks/api/useRedeemInvitation'

const LoginPage = () => {
  const router = useRouter()

  const { user, login, signup, primary } = useContext(AuthContext)
  const [redeemToken, setRedeemToken] = useState('')
  const [connectError, setConnectError] = useState('')

  const { handleSubmit, register, control, watch } = useForm({
    defaultValues: {
      name: undefined,
      password: undefined,
      email: undefined
    }
  })

  const loginMutation: ApiMutationResult<AuthResultDto> = useMutation(
    (emailPass: AuthLoginDto) => login(emailPass)
  )

  const signupMutation: ApiMutationResult<AuthSignupDto> = useMutation(
    (emailPass: AuthLoginDto) => signup(emailPass)
  )

  const { errors, errorMessage, clearErrors } = useApiErrors(
    loginMutation.isError || signupMutation.isError,
    {
      ...loginMutation.error,
      ...signupMutation.error
    }
  )

  const loading = loginMutation.isLoading || signupMutation.isLoading

  async function handleLogin(payload: AuthLoginDto) {
    loginMutation.mutate({
      email: payload.email,
      password: payload.password
    })
  }

  async function handleSignup(payload: CreateUserDto) {
    signupMutation.mutate({
      name: payload.name,
      email: payload.email,
      password: payload.password
    })
  }

  async function submit(payload) {
    clearErrors()
    if (router.query.signup) {
      handleSignup(payload)
    } else {
      handleLogin(payload)
    }
  }

  function createAccount(e) {
    e.preventDefault()
    if (router.asPath) {
      router.push('/login?signup=true', router.asPath)
    }
  }

  useEffect(() => {
    const success = signupMutation.isSuccess || loginMutation.isSuccess

    if (success) {
      /**
       * Redeem URLs are masked, and should be loaded
       * if they're available. This is typically used
       * for team invitations, organisation invitations, etc.
       */

      if (router.asPath && router.asPath.indexOf('/redeem') === 0) {
        router.push(router.asPath)
      } else {
        router.push('/start')
      }
    }
  }, [loginMutation.isSuccess, signupMutation.isSuccess])

  useEffect(() => {
    if (router.asPath) {
      const params = new URLSearchParams(router.asPath)
      if (params.get('/redeem?token')) {
        setRedeemToken(params.get('/redeem?token'))
      }
    }
  }, [router.asPath])

  const { invitationText, invitationTarget } = useRedeemInvitation(redeemToken)

  return (
    <Login title="Login">
      <div className="text-center">
        <Logo height={32} />
        <h1 className="h6 mt-2 color-grey">
          {invitationText || 'Manage your Fitlink team'}
        </h1>
      </div>
      <form onSubmit={handleSubmit(submit)} className="mt-2">
        {invitationTarget && (
          <Input
            label="Organisation"
            name="organisation"
            readOnly
            inline={true}
            value={invitationTarget}
          />
        )}

        {router.query.signup && (
          <Input
            label="Name"
            name="name"
            inline={true}
            register={register('name')}
            error={errors.name}
            disabled={loading}
            required
          />
        )}

        <Input
          label="E-mail address"
          name="email"
          type="email"
          inline={true}
          register={register('email')}
          error={errors.email}
          disabled={loading}
          required
        />
        <Input
          label="Password"
          name="password"
          type="password"
          inline={true}
          register={register('password')}
          error={errors.password}
          disabled={loading}
          required
        />

        {errorMessage !== '' && (
          <Feedback
            type="error"
            className="mt-2 text-center"
            message={errorMessage}
          />
        )}
        <div className="row ai-c mt-2">
          <div className="col">
            {!router.query.signup && (
              <Link href="/forgot-password">
                <a className="small-link inline-block">
                  Forgot password
                  <IconArrowRight />
                </a>
              </Link>
            )}
            {router.query.signup && (
              <Link href="/login">
                <a className="small-link inline-block">
                  I already have an account <IconArrowRight />
                </a>
              </Link>
            )}
          </div>
          <div className="col text-right">
            <button className="button" disabled={loading}>
              {router.query.signup ? 'Signup' : 'Login'} with e-mail
            </button>
          </div>
        </div>
      </form>

      <div className="text-center">
        <div className="or">Or</div>

        {connectError ? (
          <Feedback className="mb-2" message={connectError} type="error" />
        ) : null}
        <div className="row">
          <div className="col">
            <AppleLogin
              signup={!!router.query.signup}
              onError={setConnectError}
            />
          </div>
          <div className="col">
            <GoogleLogin
              signup={!!router.query.signup}
              onError={setConnectError}
            />
          </div>
        </div>

        {!router.query.signup && (
          <>
            <div className="or">Or</div>
            <div className="row ai-c mt-2">
              <div className="col text-left">
                <a
                  className="small-link inline-block pointer"
                  onClick={createAccount}>
                  Create a personal account
                  <IconArrowRight />
                </a>
              </div>
              <div className="col text-right">
                <Link href="/signup">
                  <button className="button alt" disabled={loading}>
                    Start a free trial
                  </button>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </Login>
  )
}

function GoogleLogin({ signup = false, onError }) {
  const { connect } = useContext(AuthContext)
  const router = useRouter()
  const {
    mutate,
    isError,
    isSuccess,
    error,
    data
  }: ApiMutationResult<AuthSignupDto> = useMutation((token: string) =>
    connect({
      provider: AuthProviderType.Google,
      token: token,
      signup
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

  useEffect(() => {
    if (isSuccess) {
      router.push('/start')
    }
  }, [isSuccess])

  useEffect(() => {
    if (isError) {
      onError(error.response.data.message)
    }
  }, [isError])

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

  // Gracefully fail and show message
  // In case of configuration issues, other login methods
  // are still rendered
  if (!googleClientId) {
    return <div>Google client not available</div>
  }

  async function signIn() {
    const auth2 = (window as any).gapi.auth2.getAuthInstance()
    try {
      const user = await auth2.signIn()
      mutate(user.getAuthResponse().id_token)
    } catch (e) {
      console.error(e)
      onError(
        'Unable to login with Google. Please note this login method is not supported in Incognito mode.'
      )
    }
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
          src="https://apis.google.com/js/platform.js?onload=onLoad&amp;v=fitlink"
          async
          defer></script>
      </Head>
      <button className="button alt block" onClick={signIn}>
        <IconGoogle className="mr-1" />
        {signup ? 'Signup' : 'Login'} with Google
      </button>
    </>
  )
}

function AppleLogin({ signup = false, onError }) {
  const { connect } = useContext(AuthContext)
  const router = useRouter()
  const {
    mutate,
    isError,
    isSuccess,
    error,
    data
  }: ApiMutationResult<AuthSignupDto> = useMutation((token: string) =>
    connect({
      provider: AuthProviderType.Apple,
      token: token,
      signup
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

  useEffect(() => {
    if (isSuccess) {
      router.push('/start')
    }
  }, [isSuccess])

  useEffect(() => {
    if (isError) {
      onError(error.response.data.message)
    }
  }, [isError])

  async function signIn() {
    try {
      const data = await (window as any).AppleID.auth.signIn()
      mutate(data.authorization.code)
    } catch (e) {
      onError('Apple login not currently available.')
    }
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
      <button className="button alt block mb-1" onClick={signIn}>
        <IconApple className="mr-1" />
        {signup ? 'Signup' : 'Login'} with Apple
      </button>
    </>
  )
}

export default LoginPage
