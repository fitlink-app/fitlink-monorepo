import React, { useEffect, useState } from 'react'
import { makeApi, Api } from '@fitlink/api-sdk'
import Axios from 'axios'
import { User } from '@fitlink/api/src/modules/users/entities/user.entity'
import { AuthResultDto } from '@fitlink/api-sdk/types'

const axios = Axios.create({
  baseURL: 'http://localhost:3001/api/v1'
})

export const api = makeApi(axios)

type Credentials = {
  email: string
  password: string
}

export type AuthContext = {
  user?: User
  api: Api
  login: (credentials: Credentials) => Promise<void>
  logout: () => void
}

export const AuthContext = React.createContext({} as AuthContext)

export function AuthProvider({ children }) {
  const [state, setState] = useState<AuthContext>({} as AuthContext)

  useEffect(() => {
    resume()
  }, [])

  async function resume() {
    const { access_token, id_token, refresh_token } = localStorage
    if (refresh_token) {
      api.setTokens({
        access_token,
        id_token,
        refresh_token
      })

      const user = await api.get<User>('/me')

      setState({
        ...state,
        user
      })
    }
  }

  async function login({ email, password }) {
    const result = await api.login({
      email,
      password
    })

    storeTokens(api.getTokens())

    const user = await api.get<User>('/me')

    setState({
      ...state,
      user
    })

    return result
  }

  /**
   * TODO: A better approach is to use an http-only cookie
   * and proxy API calls through Next.js
   *
   * Otherwise, we risk exposing these tokens to XSS exploits
   * in NPM libraries or browser extensions (that would have access
   * to localStorage)
   *
   * @param tokens
   */
  async function storeTokens(tokens: AuthResultDto) {
    Object.keys(tokens).map((key) => {
      localStorage.setItem(key, tokens[key])
    })
  }

  async function logout() {
    await api.logout()
    setState({
      ...state,
      user: null
    })
  }

  return (
    <AuthContext.Provider
      value={{
        api,
        user: state.user,
        login,
        logout
      }}>
      {children}
    </AuthContext.Provider>
  )
}
