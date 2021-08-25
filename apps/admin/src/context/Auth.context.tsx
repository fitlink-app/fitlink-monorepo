import React, { useEffect, useState } from 'react'
import { makeApi, Api } from '@fitlink/api-sdk'
import Axios from 'axios'
import { User } from '@fitlink/api/src/modules/users/entities/user.entity'
import {
  AuthResultDto,
  AuthSignupDto,
  AuthProviderType,
  AuthSwitchDto
} from '@fitlink/api-sdk/types'
import { UserRole } from '@fitlink/api/src/modules/user-roles/entities/user-role.entity'
import { Roles } from '@fitlink/api/src/modules/user-roles/user-roles.constants'
import { Organisation } from '@fitlink/api/src/modules/organisations/entities/organisation.entity'
import { Subscription } from '@fitlink/api/src/modules/subscriptions/entities/subscription.entity'
import { Team } from '@fitlink/api/src/modules/teams/entities/team.entity'
import { useQuery } from 'react-query'
import { MenuProps } from '../components/elements/MainMenu'
import { useRouter } from 'next/router'

const axios = Axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1'
})

export const api = makeApi(axios)

type Permissions = {
  superAdmin: boolean
  organisations: Partial<Organisation>[]
  subscriptions: Partial<Subscription>[]
  teams: Partial<Team>[]
}

type Credentials = {
  email: string
  password: string
}

type ConnectProvider = {
  token: string
  provider: AuthProviderType
}

type AuthSwitchTree = AuthSwitchDto & {
  pathname: string
}

export type RolePrimary = {
  subscription?: string
  organisation?: string
  team?: string
  superAdmin?: boolean
}

export type FocusRole = 'app' | 'organisation' | 'team'

export type AuthContext = {
  user?: User
  roles?: Permissions
  api: Api
  menu: MenuProps[]
  switchMode: boolean
  primary: RolePrimary
  focusRole: FocusRole
  fetchKey: string
  login: (credentials: Credentials) => Promise<AuthResultDto>
  connect: (provider: ConnectProvider) => Promise<AuthSignupDto>
  logout: () => void
  switchRole: (params: AuthSwitchDto) => Promise<AuthResultDto>
  restoreRole: () => void
  isRole: (role: Roles, id?: string) => boolean
}

export const AuthContext = React.createContext({} as AuthContext)

export type AuthProviderProps = {
  value?: Partial<AuthContext>
  children: React.ReactNode
}

export function AuthProvider({ children, value }: AuthProviderProps) {
  const [state, setState] = useState<AuthContext>({
    primary: {},
    ...value
  } as AuthContext)
  const [childRole, setChildRole] = useState<AuthSwitchDto>()
  const [roleTree, setRoleTree] = useState<AuthSwitchTree[]>([])
  const router = useRouter()
  const me = useQuery('me', () => api.get<User>('/me'), {
    enabled: false
  })

  const roles = useQuery('me/roles', () => api.get<UserRole[]>('/me/roles'), {
    enabled: false
  })

  useEffect(() => {
    resume()
  }, [])

  useEffect(() => {
    const myRoles = formatRoles(roles.data || [], childRole)
    const primary = setPrimaryRoles(myRoles)
    const focusRole = setFocusRole(primary)
    const menu = setMenu(primary)

    setState({
      ...state,
      user: me.data,
      roles: myRoles,
      menu,
      primary,
      focusRole
    })
  }, [me.data, roles.data, childRole])

  async function resume() {
    const { access_token, id_token, refresh_token } = localStorage
    if (refresh_token) {
      api.setTokens({
        access_token,
        id_token,
        refresh_token
      })

      me.refetch()
      roles.refetch()
    }
  }

  async function login({ email, password }) {
    setRoleTree([])
    setChildRole(null)

    const result = await api.login({
      email,
      password
    })

    storeTokens(api.getTokens())

    me.refetch()
    roles.refetch()

    return result
  }

  async function switchRole(params: AuthSwitchDto) {
    storePreviousTokens(api.getTokens(), params.role)
    const result = await api.loginWithRole(params)
    let focusRole: FocusRole = 'app'

    if (params.role === Roles.OrganisationAdmin) {
      focusRole = 'organisation'
    } else if (params.role === Roles.TeamAdmin) {
      focusRole = 'team'
    }

    setState({
      ...state,
      switchMode: true,
      focusRole
    })

    setChildRole(params)
    setRoleTree([
      ...roleTree,
      {
        ...params,
        pathname: router.pathname
      }
    ])

    await roles.refetch()

    router.push('/dashboard')

    return result
  }

  async function restoreRole() {
    const prev = getPreviousTokens(childRole.role)
    api.setTokens(prev)
    roles.refetch()

    // Set the previous role in the tree
    const tree = [...roleTree]
    const last = tree.pop()
    setRoleTree(tree)
    setChildRole(tree[tree.length - 1])
    setState({
      ...state,
      switchMode: tree.length > 0
    })

    router.push(last.pathname)
  }

  function formatRoles(roles: UserRole[], childRole?: AuthSwitchDto) {
    let permissions: Permissions = {
      superAdmin: false,
      organisations: [],
      subscriptions: [],
      teams: []
    }

    // If a child role is enabled, actual roles are ignored
    if (childRole) {
      if (childRole.role === Roles.OrganisationAdmin) {
        permissions.organisations.push({
          id: childRole.id
        })
        return permissions
      }

      if (childRole.role === Roles.TeamAdmin) {
        permissions.teams.push({
          id: childRole.id
        })
        return permissions
      }
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

  async function storePreviousTokens(tokens: AuthResultDto, role: Roles) {
    Object.keys(tokens).map((key) => {
      localStorage.setItem(key + '_previous_' + role, tokens[key])
    })
  }

  function getPreviousTokens(role: Roles) {
    const tokens: AuthResultDto = {
      id_token: '',
      access_token: '',
      refresh_token: ''
    }

    Object.keys(tokens).map((key) => {
      tokens[key] = localStorage.getItem(key + '_previous_' + role)
    })

    return tokens
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

  function setPrimaryRoles(roles: Permissions): RolePrimary {
    const primary: RolePrimary = {
      organisation: roles.organisations[0]
        ? roles.organisations[0].id
        : undefined,
      team: roles.teams[0] ? roles.teams[0].id : undefined,
      subscription: roles.subscriptions[0]
        ? roles.subscriptions[0].id
        : undefined
    }

    if (!primary.organisation && !primary.team && !primary.subscription) {
      if (roles.superAdmin) {
        primary.superAdmin = true
      }
    }

    return primary
  }

  function setMenu(primary: RolePrimary) {
    let items: MenuProps[] = [
      {
        label: 'Overview',
        link: '/dashboard',
        icon: 'IconGear'
      }
    ]

    if (primary.superAdmin) {
      items = items.concat([
        {
          label: 'Organisations',
          link: '/organisations',
          icon: 'IconGear'
        },
        {
          label: 'Subscriptions',
          link: '/subscriptions',
          icon: 'IconGear'
        },
        {
          label: 'Users',
          link: '/users',
          icon: 'IconFriends',
          subMenu: [
            {
              label: 'Admins',
              link: '/admins'
            }
          ]
        },
        {
          label: 'Rewards',
          link: '/rewards',
          icon: 'IconRewards'
        },
        {
          label: 'Leagues',
          link: '/leagues',
          icon: 'IconLeagues'
        },
        {
          label: 'Activities',
          link: '/activities',
          icon: 'IconActivities'
        }
      ])
    }

    if (primary.organisation) {
      items = items.concat([
        {
          label: 'Teams',
          link: '/teams',
          icon: 'IconGear'
        },
        {
          label: 'Users',
          link: '/users',
          icon: 'IconFriends',
          subMenu: [
            {
              label: 'Admins',
              link: '/admins'
            }
          ]
        },
        {
          label: 'Rewards',
          link: '/rewards',
          icon: 'IconRewards'
        },
        {
          label: 'Leagues',
          link: '/leagues',
          icon: 'IconLeagues'
        },
        {
          label: 'Activities',
          link: '/activities',
          icon: 'IconActivities'
        },
        { hr: true },
        {
          label: 'Knowledge Base',
          link: '/knowledge-base',
          icon: 'IconYoga'
        }
      ])
    }

    if (primary.team) {
      items = items.concat([
        {
          label: 'Users',
          link: '/users',
          icon: 'IconFriends'
        },
        {
          label: 'Stats',
          link: '/stats',
          icon: 'IconFriends'
        },
        {
          label: 'Rewards',
          link: '/rewards',
          icon: 'IconRewards'
        },
        {
          label: 'Leagues',
          link: '/leagues',
          icon: 'IconLeagues'
        },
        {
          label: 'Activities',
          link: '/activities',
          icon: 'IconActivities'
        },
        { hr: true },
        {
          label: 'Knowledge Base',
          link: '/knowledge-base',
          icon: 'IconYoga'
        }
      ])
    }

    return items.concat([
      { hr: true },
      {
        label: 'Sign out',
        link: '/logout',
        icon: 'IconSignOut'
      }
    ])
  }

  function setFocusRole(primary: RolePrimary): FocusRole {
    if (primary.superAdmin) {
      return 'app'
    }

    if (primary.organisation) {
      return 'organisation'
    }

    if (primary.team) {
      return 'team'
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
        menu: state.menu,
        switchMode: state.switchMode,
        primary: state.primary,
        focusRole: state.focusRole,

        /**
         * The fetch key is used to change react-query cache
         * when session changes (e.g. with switching roles)
         *
         * */
        fetchKey: [
          state.focusRole,
          state.primary.organisation,
          state.primary.team,
          state.primary.subscription,
          state.primary.superAdmin
        ].join('_'),
        login,
        logout,
        connect,
        switchRole,
        restoreRole,
        isRole
      }}>
      {children}
    </AuthContext.Provider>
  )
}
