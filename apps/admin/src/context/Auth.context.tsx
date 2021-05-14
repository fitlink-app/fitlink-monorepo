import React, { useState } from 'react'
import { makeApi, Api } from '../../../sdk/api'
import Axios from 'axios'

const axios = Axios.create({
  baseURL: 'http://localhost:3001/api/v1'
})

export const api = makeApi(axios)

type Credentials = {
  email: string
  password: string
}

export type AuthContext = {
  user?: {
    id: string
  }
  api: Api
  login: (credentials: Credentials) => Promise<void>
  logout: () => void
}

export const AuthContext = React.createContext({} as AuthContext)

export function AuthProvider({ children }) {
  const [state, setState] = useState<AuthContext>({})

  async function login({ email, password }) {
    const { access_token /*, refresh_token, id_token */ } = await api.post(
      '/auth/login',
      {
        email,
        password
      }
    )

    api.setToken(access_token)

    const user = await api.get('/me')

    setState({
      ...state,
      user
    })
  }

  async function logout() {
    api.setToken(null)
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
