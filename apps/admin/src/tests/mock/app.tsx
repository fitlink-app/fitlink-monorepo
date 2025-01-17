import { AuthProvider, AuthContext } from '../../context/Auth.context'
import { QueryClient, QueryClientProvider } from 'react-query'
import '../../scss/Main.scss'
import { ErrorBoundary } from '../../errors/boundary'
import React from 'react'

const useRouter = jest.spyOn(require('next/router'), 'useRouter')

useRouter.mockImplementation(() => ({
  push: jest.fn(() => Promise.resolve()),
  prefetch: jest.fn(() => Promise.resolve()),
  query: {},
  isReady: true
}))

const queryClient = new QueryClient()

type AppProps = {
  children: React.ReactNode
  authContext?: Partial<AuthContext>
}

function Fitlink({ children, authContext }: AppProps) {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider value={authContext}>{children}</AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default Fitlink
