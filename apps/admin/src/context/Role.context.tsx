import React, { MutableRefObject, useContext, useEffect, useRef } from 'react'
import { AuthContext } from './Auth.context'

type RoleContext = {
  organisation: MutableRefObject<string>
  subscription: MutableRefObject<string>
  team: MutableRefObject<string>
}

export const RoleContext = React.createContext({} as RoleContext)

export type RoleProviderProps = {
  children: React.ReactNode
}

export function RoleProvider({ children }: RoleProviderProps) {
  const { primary } = useContext(AuthContext)

  const organisation = useRef<string>()
  const subscription = useRef<string>()
  const team = useRef<string>()

  useEffect(() => {
    if (primary.organisation) {
      organisation.current = primary.organisation
    }
    if (primary.subscription) {
      subscription.current = primary.subscription
    }
    if (primary.team) {
      team.current = primary.team
    }
  }, [primary])

  return (
    <RoleContext.Provider
      value={{
        organisation,
        subscription,
        team
      }}>
      {children}
    </RoleContext.Provider>
  )
}
