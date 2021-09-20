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
  AuthRequestResetPasswordDto,
  AuthResetPassword,
  UpdateResult
} from '@fitlink/api-sdk/types'
import toast from 'react-hot-toast'
import { ApiMutationResult } from '../../../common/react-query/types'
import useApiErrors from '../hooks/useApiErrors'
import { AuthResetPasswordDto } from '../../../api/src/modules/auth/dto/auth-reset-password'

export default function ForgotPassword() {
  const { api } = useContext(AuthContext)
  const router = useRouter()

  const { handleSubmit, register } = useForm({
    defaultValues: {
      password: undefined,
      password_confirm: undefined
    }
  })

  const resetPassword: ApiMutationResult<UpdateResult> = useMutation(
    'reset_password',
    (payload: AuthResetPasswordDto) => {
      return api.put<AuthResetPassword>('/auth/reset-password', {
        payload
      })
    }
  )

  async function onSubmit({
    password,
    password_confirm
  }: {
    password: string
    password_confirm: string
  }) {
    if (password !== password_confirm) {
      setMessage('Passwords do not match')
      return
    }

    const promise = resetPassword.mutateAsync({
      password: password,
      token: router.query.token
    })

    try {
      toast.promise(promise, {
        loading: <b>Saving...</b>,
        success: <b>Password updated</b>,
        error: <b>Error</b>
      })
    } catch (e) {
      console.error(e)
    }
  }

  const { errors, errorMessage, setMessage } = useApiErrors(
    resetPassword.isError,
    resetPassword.error
  )

  return (
    <Login title="Forgot Password">
      <div className="text-center">
        <Logo height={32} />
        <h1 className="h6 mt-2 color-grey">Enter your new password</h1>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-2">
        {!resetPassword.isSuccess && (
          <>
            <Input
              label="New Password"
              name="password"
              type="password"
              register={register('password')}
              error={errors.password}
              required
            />
            <Input
              label="Confirm New Password"
              name="password_confirm"
              type="password"
              register={register('password_confirm')}
              required
            />
          </>
        )}
        {errorMessage && (
          <Feedback type="error" className="mt-2" message={errorMessage} />
        )}
        {resetPassword.isSuccess && (
          <Feedback
            type="success"
            className="mt-2"
            message={'You have successfully reset your password.'}
          />
        )}
        <div className="row ai-c mt-2">
          {resetPassword.isSuccess && (
            <div className="col">
              <Link href="/login">
                <a className="small-link inline-block">
                  Login here
                  <IconArrowRight />
                </a>
              </Link>
            </div>
          )}
          {!resetPassword.isSuccess && (
            <div className="col text-right">
              <button className="button" disabled={resetPassword.isLoading}>
                Reset Password
              </button>
            </div>
          )}
        </div>
      </form>
    </Login>
  )
}
