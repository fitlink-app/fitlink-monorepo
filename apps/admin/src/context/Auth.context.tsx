import React, { useState } from 'react'
import { makeApi, Api } from '@fitlink/api-sdk'
import Axios from 'axios'
import { User } from '@fitlink/api/src/modules/users/entities/user.entity'

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

  async function login({ email, password }) {
    await api.login({
      email,
      password
    })

    const user = await api.get<User>('/me')

    setState({
      ...state,
      user
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
