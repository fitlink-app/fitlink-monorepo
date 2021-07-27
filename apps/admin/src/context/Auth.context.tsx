import React, { useEffect, useState } from 'react'
import { makeApi, Api } from '@fitlink/api-sdk'
import Axios from 'axios'
import { User } from '@fitlink/api/src/modules/users/entities/user.entity'
import {
  AuthResultDto,
  AuthSignupDto,
  AuthProviderType
} from '@fitlink/api-sdk/types'
import { UserRole } from '@fitlink/api/src/modules/user-roles/entities/user-role.entity'
import { Roles } from '@fitlink/api/src/modules/user-roles/user-roles.constants'
import { Organisation } from '@fitlink/api/src/modules/organisations/entities/organisation.entity'
import { Subscription } from '@fitlink/api/src/modules/subscriptions/entities/subscription.entity'
import { Team } from '@fitlink/api/src/modules/teams/entities/team.entity'

const axios = Axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1'
})

export const api = makeApi(axios)

type Permissions = {
  superAdmin: boolean
  organisations: Organisation[]
  subscriptions: Subscription[]
  teams: Team[]
}

type Credentials = {
  email: string
  password: string
}

type ConnectProvider = {
  token: string
  provider: AuthProviderType
}

export type AuthContext = {
  user?: User
  roles?: Permissions
  api: Api
  login: (credentials: Credentials) => Promise<AuthResultDto>
  connect: (provider: ConnectProvider) => Promise<AuthSignupDto>
  logout: () => void
  isRole: (role: Roles, id?: string) => boolean
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

    const roles = await api.get<UserRole[]>('/me/roles')

    setState({
      ...state,
      user,
      roles: formatRoles(roles)
    })

    return result
  }

  function formatRoles(roles: UserRole[]) {
    let permissions: Permissions = {
      superAdmin: false,
      organisations: [],
      subscriptions: [],
      teams: []
    }
    roles.forEach((role) => {
      if (role.role === Roles.SuperAdmin) {
        permissions.superAdmin = true
      }

      if (role.role === Roles.OrganisationAdmin) {
        permissions.organisations.push(role.organisation)
      }

      if (role.role === Roles.SubscriptionAdmin) {
        permissions.subscriptions.push(role.subscription)
      }

      if (role.role === Roles.TeamAdmin) {
        permissions.teams.push(role.team)
      }
    })

    console.log(permissions)

    return permissions
  }

  /**
   * Connect to Apple or Google
   *
   * In the case of Google, the id_token must be supplied
   * In the case of Apple, the authorization.code must be supplied
   *
   * @param ConnectProvider { token, provider }
   * @returns
   */
  async function connect({ token, provider }: ConnectProvider) {
    const result = await api.connect({
      token,
      provider
    })

    storeTokens(api.getTokens())

    const user = result.me

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
   * For now this is a workaround for development purposes,
   * but will need to change for launch ASAP.
   *
   * Alternatively, we can store these in-memory only
   * and prevent a user from hard-reloading a page with prompts, however
   * this may not prevent malicious code listening to network requests.
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

  function isRole(role: Roles, id?: string): boolean {
    if (role === Roles.SuperAdmin) {
      return state.roles.superAdmin
    }

    if (role === Roles.OrganisationAdmin) {
      if (id) {
        return !!state.roles.organisations.filter((e) => e.id === id).length
      }
      return !!state.roles.organisations.length
    }

    if (role === Roles.SubscriptionAdmin) {
      if (id) {
        return !!state.roles.subscriptions.filter((e) => e.id === id).length
      }
      return !!state.roles.subscriptions.length
    }

    if (role === Roles.TeamAdmin) {
      if (id) {
        return !!state.roles.teams.filter((e) => e.id === id).length
      }
      return !!state.roles.teams.length
    }
  }

  return (
    <AuthContext.Provider
      value={{
        api,
        user: state.user,
        roles: state.roles || {
          superAdmin: false,
          organisations: [],
          subscriptions: [],
          teams: []
        },
        login,
        logout,
        connect,
        isRole
      }}>
      {children}
    </AuthContext.Provider>
  )
}
