import React, { useEffect, useState } from 'react'
import { makeApi, Api } from '@fitlink/api-sdk'
import Axios from 'axios'
import { User } from '@fitlink/api/src/modules/users/entities/user.entity'
import {
  AuthResultDto,
  AuthSignupDto,
  AuthProviderType,
  AuthSwitchDto,
  AuthLoginDto,
  CreateUserDto
} from '@fitlink/api-sdk/types'
import { UserRole } from '@fitlink/api/src/modules/user-roles/entities/user-role.entity'
import { Roles } from '@fitlink/api/src/modules/user-roles/user-roles.constants'
import { Organisation } from '@fitlink/api/src/modules/organisations/entities/organisation.entity'
import { Subscription } from '@fitlink/api/src/modules/subscriptions/entities/subscription.entity'
import { Team } from '@fitlink/api/src/modules/teams/entities/team.entity'
import { useQuery } from 'react-query'
import { MenuProps } from '../components/elements/MainMenu'
import { useRouter } from 'next/router'
import { OrganisationMode } from '@fitlink/api/src/modules/organisations/organisations.constants'
import { AuthenticatedUserRoles } from '@fitlink/api/src/models/authenticated-user.model'
import menuApp from '../data/menu/app'
import {
  MenuOrganisationComplex,
  MenuOrganisationSimple
} from '../data/menu/organisation'
import menuSub from '../data/menu/subscription'
import menuTeam from '../data/menu/team'
import menuUser from '../data/menu/user'

const axios = Axios.create({
  baseURL: '/api/v1'
  ///process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1'
})

export const api = makeApi(axios, {
  onRefreshTokenFail: () => {
    console.log('Refresh token failed')
    window.location.href = '/login'
  },
  // TODO: Likely need to change this to a dynamic value
  clientId: 'Fitlink'
})

// URLs where localStorage state can be completely
// reset, as the user is expected to be in a clean state.
const statelessUrls = [
  '/signup',
  '/login',
  '/verify-email',
  '/reset-password',
  '/forgot-password'
]

export type FocusRole =
  | 'app'
  | 'organisation'
  | 'team'
  | 'subscription'
  | 'user'

export type Primary = {
  organisation?: string
  subscription?: string
  team?: string
}

type ConnectProvider = {
  token: string
  provider: AuthProviderType
  signup?: boolean
}

export type AuthContext = {
  focusRole: FocusRole
  modeRole: FocusRole
  primary: Primary
  fetchKey: string
  api: Api
  menu: MenuProps[]
  mode: OrganisationMode
  user: User
  team?: Team
  signup: (credentials: CreateUserDto) => Promise<AuthSignupDto>
  login: (credentials: AuthLoginDto) => Promise<AuthResultDto>
  connect: (provider: ConnectProvider) => Promise<AuthSignupDto>
  logout: () => Promise<void>
  switchRole: (params: AuthSwitchDto) => Promise<AuthResultDto>
  setModeRole: (role: FocusRole) => void
  setFocusRole: (role: FocusRole) => void
  refreshUser: () => Promise<void>
  hasRole: (role: Roles) => boolean
  fetchUser: () => Promise<void>
}

export const AuthContext = React.createContext({} as AuthContext)

export type AuthProviderProps = {
  value?: Partial<AuthContext>
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [focusRole, setFocusRole] = useState<FocusRole>()
  const [modeRole, setModeRole] = useState<FocusRole>()
  const [primary, setPrimary] = useState<Primary>({})
  const [user, setUser] = useState<User>()
  const [team, setTeam] = useState<Team>()
  const [fetchKey, setFetchKey] = useState<string>('default')
  const [menu, setMenu] = useState<MenuProps[]>([])
  const [mode, setMode] = useState<OrganisationMode>(OrganisationMode.Simple)

  const router = useRouter()

  const me = useQuery('me', () => api.get<User>('/me'), {
    enabled: false,
    retry: false
  })

  const roles = useQuery('me/roles', () => api.get<UserRole[]>('/me/roles'), {
    enabled: false,
    retry: false
  })

  const role = useQuery(
    'me/role',
    () => api.get<AuthenticatedUserRoles>('/me/role'),
    {
      enabled: false,
      retry: false
    }
  )

  /**
   * Redirect the user to login if you cannot authenticate.
   */
  useEffect(() => {
    if (me.isError) {
      router.push('/login', {
        query: router.query
      })
    }
  }, [me.isError])

  /**
   * Once any localStorage state has been loaded into
   * memory, we're ready to load the user's profile
   * and roles.
   */
  useEffect(() => {
    if (router.isReady && !statelessUrls.includes(router.pathname)) {
      resume(true)
    }
  }, [router.isReady])

  /**
   * Update the menu
   *
   */
  useEffect(() => {
    const menu = buildMenu(focusRole, primary, mode)
    setMenu(menu)
  }, [focusRole, primary])

  async function resume(resumeFromRouter = false) {
    const { data } = await roles.refetch()
    const myData = await me.refetch()

    if (!data) {
      return
    }

    if (myData.isSuccess) {
      setUser(myData.data)
    }

    if (resumeFromRouter && myData.isSuccess) {
      const currentRole = await role.refetch()

      if (
        currentRole.data.subscription_admin[0] &&
        !currentRole.data.organisation_admin[0]
      ) {
        setPrimary({
          organisation: undefined,
          subscription: currentRole.data.subscription_admin[0],
          team: undefined
        })
        setModeRole('subscription')
        setFocusRole('subscription')
      } else if (!currentRole.data.super_admin) {
        // Restore primary ids from current role
        setPrimary({
          organisation: currentRole.data.organisation_admin[0],
          subscription: currentRole.data.subscription_admin[0],
          team: currentRole.data.team_admin[0]
        })

        let org: Organisation
        if (currentRole.data.organisation_admin[0]) {
          org = await fetchOrganisation(currentRole.data.organisation_admin[0])
          setTeam(org.teams[0])

          if (org && org.mode === OrganisationMode.Complex) {
            setMode(OrganisationMode.Complex)
          } else {
            setMode(OrganisationMode.Simple)
          }

          setFocusRole('organisation')
        } else {
          setFocusRole('team')
        }

        if (currentRole.data.team_admin[0]) {
          if (org && org.mode === OrganisationMode.Complex) {
            setModeRole('organisation')
          } else {
            setModeRole('team')
          }

          const team = await fetchTeam(currentRole.data.team_admin[0])
          setTeam(team)
        }
      } else {
        setFocusRole('app')
        setModeRole('app')
      }

      setFetchKey(`mode${Date.now()}`)
      return
    }

    /**
     * In organisation "Simple" mode we support
     * only superadmin role and organisation role.
     *
     * This keeps the UX/UI simple before we introduce complexity
     * later to support larger organisations with multiple teams.
     *
     */

    if (data.filter((e) => e.role === Roles.SuperAdmin).length) {
      setFocusRole('app')
      setModeRole('app')
    } else {
      const orgRole = data.filter((e) => e.role === Roles.OrganisationAdmin)[0]
      const teamRole = data.filter((e) => e.role === Roles.TeamAdmin)[0]

      if (orgRole && orgRole.organisation.mode === OrganisationMode.Simple) {
        setPrimary({
          organisation: orgRole.organisation.id,
          subscription: orgRole.organisation.subscriptions[0].id,
          team: orgRole.organisation.teams[0].id
        })

        setFocusRole('organisation')
        setModeRole('team')
        setTeam(orgRole.organisation.teams[0])
      } else if (
        orgRole &&
        orgRole.organisation.mode === OrganisationMode.Complex
      ) {
        setPrimary({
          organisation: orgRole.organisation.id,
          subscription: orgRole.organisation.subscriptions[0].id,
          team: orgRole.organisation.teams[0].id
        })

        setFocusRole('organisation')
        setModeRole('organisation')
        setMode(OrganisationMode.Complex)
        setTeam(orgRole.organisation.teams[0])
      } else if (teamRole) {
        setPrimary({
          organisation: undefined,
          subscription: undefined,
          team: teamRole.team.id
        })
        setFocusRole('team')
        setModeRole('team')
        setMode(OrganisationMode.Simple)
        setTeam(teamRole.team)
      }
    }

    setFetchKey(`mode${Date.now()}`)
  }

  async function login({ email, password }) {
    const result = await api.login({
      email,
      password
    })

    try {
      await resume()
    } catch (e) {
      console.error(e)
    }

    console.log('HERE', result)

    return result
  }

  async function signup({ email, password, name }) {
    const result = await api.signUp({
      name,
      email,
      password
    })

    await resume()

    return result
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
  async function connect({ token, provider, signup }: ConnectProvider) {
    const result = await api.connect({
      token,
      provider,
      signup,
      desktop: true
    })

    const { data } = await me.refetch()
    if (data) {
      setUser(data)
    }

    return result
  }

  async function logout() {
    await api.logout()
    setUser(null)
  }

  async function fetchUser() {
    const { data } = await me.refetch()
    if (data) {
      setUser(data)
    }
  }

  async function switchRole(params: AuthSwitchDto) {
    if (params.role === Roles.Self) {
      await api.loginWithRole(params)
      setFetchKey(`mode${Date.now()}`)
      setFocusRole('user')
      setModeRole('user')
      return
    } else {
      setFocusRole(null)
      setModeRole(null)
    }

    const result = await api.loginWithRole(params)
    let role: FocusRole = 'app'
    let mode: FocusRole = 'app'
    let organisation: string
    let team: string
    let subscription: string

    if (params.role === Roles.OrganisationAdmin) {
      role = 'organisation'
      mode = 'team'

      // Fetch the organisation and associated team and subscription
      const org = await fetchOrganisation(params.id)
      organisation = org.id
      team = org.teams[0].id
      subscription = org.subscriptions.filter((e) => e.default)[0].id

      if (org.mode === OrganisationMode.Complex) {
        mode = 'organisation'
      }
      setTeam(org.teams[0])
    } else if (params.role === Roles.TeamAdmin) {
      role = 'team'
      mode = 'team'

      // Fetch the current organisation and requested team and subscription
      const teamEntity = await fetchTeam(params.id)
      organisation = teamEntity.organisation.id
      team = params.id
      subscription = teamEntity.organisation.subscriptions.filter(
        (e) => e.default
      )[0].id
      setTeam(teamEntity)
    } else if (params.role === Roles.SubscriptionAdmin) {
      role = 'subscription'
    }

    setFetchKey(`mode${Date.now()}`)
    setFocusRole(role)
    setModeRole(mode)
    setMode(
      mode === 'team' ? OrganisationMode.Simple : OrganisationMode.Complex
    )
    setPrimary({
      organisation,
      subscription,
      team
    })

    const myData = await me.refetch()
    setUser(myData.data)

    if (params.role === Roles.SubscriptionAdmin) {
      await router.push(`/subscriptions/${params.id}`)
    } else {
      await router.push('/dashboard')
    }

    return result
  }

  async function fetchOrganisation(id: string) {
    return api.get<Organisation>('/organisations/:organisationId', {
      organisationId: id
    })
  }

  async function fetchTeam(id: string) {
    return api.get<Team>('/teams/:teamId', {
      teamId: id
    })
  }

  async function refreshUser() {
    await resume()
  }

  function hasRole(role: Roles) {
    if (roles.isSuccess) {
      return roles.data.filter((each) => each.role === role).length > 0
    } else {
      return false
    }
  }

  return (
    <AuthContext.Provider
      value={{
        focusRole,
        modeRole,
        primary,
        fetchKey,
        api,
        menu,
        mode,
        user,
        team,
        login,
        logout,
        signup,
        connect,
        switchRole,
        setModeRole,
        setFocusRole,
        refreshUser,
        hasRole,
        fetchUser
      }}>
      {children}
    </AuthContext.Provider>
  )
}

function buildMenu(
  focusRole: FocusRole,
  primary: Primary,
  mode: OrganisationMode
): MenuProps[] {
  switch (focusRole) {
    case 'app':
      return menuApp(primary)
    case 'organisation':
      if (mode === OrganisationMode.Simple) {
        return MenuOrganisationSimple(primary)
      } else {
        return MenuOrganisationComplex(primary)
      }
    case 'subscription':
      return menuSub(primary)
    case 'team':
      return menuTeam(primary)
    case 'user':
      return menuUser()
  }
}
