import React, { useContext, useEffect } from 'react'
import Logo from '../components/elements/Logo'
import Login from '../components/layouts/Login'
import Feedback from '../components/elements/Feedback'
import { AuthContext } from '../context/Auth.context'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useMutation } from 'react-query'
import useApiErrors from '../hooks/useApiErrors'
import { ApiMutationResult } from '@fitlink/common/react-query/types'
import { VerifyUserEmailResultDto } from '@fitlink/api/src/modules/users/dto/update-user.dto'
import { VerifyUserEmail } from '../../../api-sdk/types'

const RedeemPage = () => {
  const router = useRouter()
  const { api } = useContext(AuthContext)

  const verify: ApiMutationResult<VerifyUserEmailResultDto> = useMutation(
    'verify_email',
    (token: string) => {
      return api.post<VerifyUserEmail>('/users/verify-email', {
        payload: {
          token
        }
      })
    }
  )

  const { isError, errorMessage, setMessage } = useApiErrors(
    verify.isError,
    verify.error
  )

  useEffect(() => {
    if (router.isReady) {
      if (router.query.token) {
        verify.mutate(router.query.token)
      } else {
        setMessage(
          'Invalid URL. Please check your email and follow the link provided.'
        )
      }
    }
  }, [router.isReady])

  return (
    <Login title="Login">
      <div className="text-center">
        <Logo height={32} />
        <h1 className="h6 mt-2 color-grey">Confirm your email address</h1>
      </div>
      {errorMessage && (
        <Feedback message={errorMessage} type="error" className="mt-2 mb-2" />
      )}
      {verify.isSuccess && (
        <>
          <Feedback
            message={'Email successfully verified'}
            type="success"
            className="mt-2 mb-2"
          />
          <Link href={verify.data.link}>
            <a className="button alt">Launch App</a>
          </Link>
        </>
      )}
    </Login>
  )
}

export default RedeemPage
