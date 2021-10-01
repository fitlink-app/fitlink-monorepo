import { useEffect } from 'react'
import { AppProps } from 'next/app'
import { AuthProvider } from '../context/Auth.context'
import { QueryClient, QueryClientProvider } from 'react-query'
import '../scss/Main.scss'
import { ErrorBoundary } from '../errors/boundary'
import { RoleProvider } from '../context/Role.context'
import { IntercomProvider, useIntercom } from 'react-use-intercom'
import { useRouter } from 'next/router'

const queryClient = new QueryClient()

function Fitlink(appProps: AppProps) {
  return (
    <ErrorBoundary>
      <IntercomProvider appId="jhnnkwbj">
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <RoleProvider>
              <App {...appProps} />
            </RoleProvider>
          </AuthProvider>
        </QueryClientProvider>
      </IntercomProvider>
    </ErrorBoundary>
  )
}

function App({ Component, pageProps }: AppProps) {
  const { boot } = useIntercom()
  const router = useRouter()
  useEffect(() => {
    if (router.isReady) {
      boot()
    }
  }, [router.isReady])
  return <Component {...pageProps} />
}

export default Fitlink
