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

const axios = Axios.create({
  baseURL: '/api/v1'
})

export const api = makeApi(axios)

const statelessUrls = ['/signup', '/login']

type Permissions = {
  superAdmin: boolean
  organisations: Partial<Organisation>[]
  subscriptions: Partial<Subscription>[]
  teams: Partial<Team>[]
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

export type FocusRole =
  | 'app'
  | 'organisation'
  | 'team'
  | 'subscription'
  | 'user'

export type AuthContext = {
  user?: User
  roles?: Permissions
  api: Api
  menu: MenuProps[]
  switchMode: boolean
  primary: RolePrimary
  focusRole: FocusRole
  fetchKey: string
  ready?: boolean
  signup: (credentials: CreateUserDto) => Promise<AuthSignupDto>
  login: (credentials: AuthLoginDto) => Promise<AuthResultDto>
  connect: (provider: ConnectProvider) => Promise<AuthSignupDto>
  logout: () => Promise<void>
  switchRole: (params: AuthSwitchDto) => Promise<AuthResultDto>
  restoreRole: () => Promise<void>
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
  const [readyToResume, setReadyToResume] = useState(false)
  const [childRole, setChildRole] = useState<AuthSwitchDto>()
  const [roleTree, setRoleTree] = useState<AuthSwitchTree[]>([])
  const router = useRouter()
  const me = useQuery('me', () => api.get<User>('/me'), {
    enabled: false,
    retry: false
  })

  const roles = useQuery('me/roles', () => api.get<UserRole[]>('/me/roles'), {
    enabled: false,
    retry: false
  })

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
   * If on a route that requires loading the user's profile
   * from page load, load the stored (localStorage) state
   * into memory which will determine the permissions of
   * the interface to display to the user.
   */
  useEffect(() => {
    if (!readyToResume && router.isReady) {
      // On stateless urls (.e.g login and signup)
      // the stored state can be cleared.
      if (statelessUrls.includes(router.pathname)) {
        clearStoredState()
      } else {
        resumeStoredState()
      }
    }
  }, [router.isReady, router.pathname])

  /**
   * Once any localStorage state has been loaded into
   * memory, we're ready to load the user's profile
   * and roles.
   */
  useEffect(() => {
    if (readyToResume) {
      resume()
    }
  }, [readyToResume])

  useEffect(() => {
    if (readyToResume) {
      const myRoles = formatRoles(roles.data || [], childRole)
      const primary = setPrimaryRoles(myRoles)
      const focusRole = setFocusRole(primary)
      const menu = setMenu(focusRole)
      const newState = {
        ...state,
        user: me.data,
        menu,
        primary,
        focusRole
      }

      storeState(newState)
      setState(newState)
    }
  }, [me.data, roles.data, childRole, roleTree, readyToResume])

  /**
   * Stores the state of role switching
   * @param state
   */
  function storeState(state: AuthContext) {
    localStorage.setItem(
      'fitlink',
      JSON.stringify({
        roleTree: roleTree,
        childRole: childRole,
        switchMode: state.switchMode,
        focusRole: state.focusRole
      })
    )
  }

  function resumeStoredState() {
    const stored = localStorage.getItem('fitlink')
    if (stored) {
      const parsed = JSON.parse(stored)
      setRoleTree(parsed.roleTree)
      setChildRole(parsed.childRole)
      setState({
        ...state,
        switchMode: parsed.switchMode,
        focusRole: parsed.focusRole
      })
    }

    setReadyToResume(true)
  }

  function clearStoredState() {
    localStorage.removeItem('fitlink')
  }

  async function resume() {
    me.refetch()
    roles.refetch()
  }

  async function login({ email, password }) {
    setRoleTree([])
    setChildRole(null)

    const result = await api.login({
      email,
      password
    })

    me.refetch()
    roles.refetch()

    return result
  }

  async function signup({ email, password, name }) {
    setRoleTree([])
    setChildRole(null)

    const result = await api.signUp({
      name,
      email,
      password
    })

    me.refetch()
    roles.refetch()

    return result
  }

  async function switchRole(params: AuthSwitchDto) {
    // storePreviousTokens(api.getTokens(), params.role)
    const result = await api.loginWithRole(params)
    let focusRole: FocusRole = 'app'

    if (params.role === Roles.OrganisationAdmin) {
      focusRole = 'organisation'
    } else if (params.role === Roles.TeamAdmin) {
      focusRole = 'team'
    } else if (params.role === Roles.SubscriptionAdmin) {
      focusRole = 'subscription'
    }

    setState({
      ...state,
      switchMode: true,
      focusRole
    })

    if (focusRole !== 'app') {
      setChildRole(params)
      setRoleTree([
        ...(roleTree || []),
        {
          ...params,
          pathname: router.pathname
        }
      ])
    } else {
      setChildRole(undefined)
      setRoleTree([])
    }

    if (params.role === Roles.SubscriptionAdmin) {
      router.push('/billing')
    } else {
      router.push('/dashboard')
    }

    return result
  }

  async function restoreRole() {
    // Set the previous role in the tree
    const tree = [...roleTree]
    const last = tree.pop()
    const newRole = tree[tree.length - 1]

    // Restore the previous role to the API / session
    await api.loginWithRole({
      role: newRole ? newRole.role : undefined,
      id: newRole ? newRole.id : undefined
    })

    // If a previous item exists route to it.
    if (last) {
      await router.push(last.pathname)
    } else {
      await router.push('/start')
    }

    setRoleTree(tree)
    setChildRole(tree[tree.length - 1])
    setState({
      ...state,
      switchMode: tree.length > 0
    })
  }

  function formatRoles(roles: UserRole[], childRole?: AuthSwitchDto) {
    let permissions: Permissions = {
      superAdmin: false,
      organisations: [],
      subscriptions: [],
      teams: []
    }

    // If a child role is enabled, actual roles are ignored
    // and this role supercedes all others
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

      if (childRole.role === Roles.SubscriptionAdmin) {
        permissions.subscriptions.push({
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

    if (permissions.superAdmin) {
      return {
        superAdmin: true,
        organisations: [],
        subscriptions: [],
        teams: []
      }
    }

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

    const user = result.me

    setState({
      ...state,
      user
    })

    return result
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

  function setMenu(focusRole: FocusRole) {
    let items: MenuProps[] = []

    if (
      focusRole === 'organisation' ||
      focusRole === 'team' ||
      focusRole === 'app'
    ) {
      items = items.concat([
        {
          label: 'Overview',
          link: '/dashboard',
          icon: 'IconGear'
        }
      ])
    }

    if (focusRole === 'app') {
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
              link: '/admins/global'
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
        {
          label: 'Global Configuration',
          link: '/global-config',
          icon: 'IconGear'
        }
      ])
    }

    if (focusRole === 'organisation') {
      items = items.concat([
        {
          label: 'Subscriptions',
          link: '/subscriptions',
          icon: 'IconGear'
        },
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
              link: '/admins/organisation'
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

    if (focusRole === 'team') {
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

    if (focusRole === 'subscription') {
      items = items.concat([
        {
          label: 'Billing',
          link: '/billing',
          icon: 'IconCreditCard'
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

    if (primary.subscription) {
      return 'subscription'
    }

    if (primary.team) {
      return 'team'
    }

    if (primary.organisation) {
      return 'organisation'
    }

    return 'user'
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
        ready: state.ready,

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
        signup,
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
