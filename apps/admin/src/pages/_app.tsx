import { AppProps } from 'next/app'
import { AuthProvider } from '../context/Auth.context'
import { QueryClient, QueryClientProvider } from 'react-query'
import '../scss/Main.scss'
import { ErrorBoundary } from '../errors/boundary'
import { RoleProvider } from '../context/Role.context'

const queryClient = new QueryClient()

function Fitlink({ Component, pageProps }: AppProps) {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RoleProvider>
            <Component {...pageProps} />
          </RoleProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default Fitlink
