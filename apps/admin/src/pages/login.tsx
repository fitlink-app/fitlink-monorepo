import React, { useContext, useState } from 'react'
import { AuthContext } from '../context/Auth.context'
import { useMutation } from 'react-query'
import { AuthLoginDto, AuthResultDto } from '@fitlink/api-sdk/types'
import { getErrorMessage } from '@fitlink/api-sdk'
import { ApiMutationResult } from '@fitlink/common/react-query/types'
import jwtDecode, { JwtPayload } from 'jwt-decode'

const Login = () => {
  const { api } = useContext(AuthContext)
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const {
    mutate,
    isError,
    isSuccess,
    error,
    data
  }: ApiMutationResult<AuthResultDto> = useMutation((login: AuthLoginDto) =>
    api.login(login)
  )

  return (
    <form method="post" onSubmit={(e) => e.preventDefault()}>
      {isError && getErrorMessage(error)}
      {isSuccess && JSON.stringify(jwtDecode<JwtPayload>(data.access_token))}
      <div>
        <label>Password</label>
        <input
          type="password"
          name="password"
          onChange={(e) => setPassword(e.currentTarget.value)}
        />
      </div>

      <div>
        <label>Email</label>
        <input
          type="email"
          name="email"
          onChange={(e) => setEmail(e.currentTarget.value)}
        />
      </div>
      <button
        onClick={() => {
          mutate({ email, password })
        }}>
        Login
      </button>
    </form>
  )
}

export default Login
