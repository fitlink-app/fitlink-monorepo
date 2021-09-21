import { useContext, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Input from '../components/elements/Input'
import Logo from '../components/elements/Logo'
import Login from '../components/layouts/Login'
import Feedback from '../components/elements/Feedback'
import IconArrowRight from '../components/icons/IconArrowRight'
import { useForm } from 'react-hook-form'
import { useMutation } from 'react-query'
import { AuthContext } from '../context/Auth.context'
import {
  AuthRequestResetPassword,
  AuthRequestResetPasswordDto
} from '@fitlink/api-sdk/types'
import toast from 'react-hot-toast'
import { ApiMutationResult } from '../../../common/react-query/types'
import useApiErrors from '../hooks/useApiErrors'

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const { api } = useContext(AuthContext)
  const router = useRouter()

  const { handleSubmit, register } = useForm({
    defaultValues: {
      email: undefined
    }
  })

  const requestPasswordReset: ApiMutationResult<boolean> = useMutation(
    'request_password_reset',
    (payload: { email: string }) => {
      return api.post<AuthRequestResetPassword>(
        '/auth/request-password-reset',
        {
          payload
        }
      )
    }
  )

  async function onSubmit(payload: { email: string }) {
    const promise = requestPasswordReset.mutateAsync({
      email: payload.email
    })

    try {
      toast.promise(promise, {
        loading: <b>Sending...</b>,
        success: <b>Verification sent</b>,
        error: <b>Error</b>
      })
    } catch (e) {
      console.error(e)
    }
  }

  const { errors, errorMessage } = useApiErrors(
    requestPasswordReset.isError,
    requestPasswordReset.error
  )

  return (
    <Login title="Forgot Password">
      <div className="text-center">
        <Logo height={32} />
        <h1 className="h6 mt-2 color-grey">
          Enter your email address to reset your password
        </h1>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-2">
        <Input
          label="E-mail address"
          name="email"
          type="email"
          register={register('email')}
          error={errors.email}
          required
        />
        {errorMessage && (
          <Feedback type="error" className="mt-2" message={errorMessage} />
        )}
        {requestPasswordReset.isSuccess && (
          <Feedback
            type="success"
            className="mt-2"
            message={'Please check your inbox.'}
          />
        )}
        <div className="row ai-c mt-2">
          <div className="col">
            <Link href="/login">
              <a className="small-link inline-block">
                Login here
                <IconArrowRight />
              </a>
            </Link>
          </div>
          <div className="col text-right">
            <button className="button" disabled={loading}>
              Send reset e-mail
            </button>
          </div>
        </div>
      </form>
    </Login>
  )
}
