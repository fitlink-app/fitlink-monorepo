import { useEffect, useContext } from 'react'
import { AppProps } from 'next/app'
import { AuthContext, AuthProvider } from '../context/Auth.context'
import { QueryClient, QueryClientProvider } from 'react-query'
import '../scss/Main.scss'
import { ErrorBoundary } from '../errors/boundary'
import { RoleProvider } from '../context/Role.context'
import {
  IntercomProvider,
  useIntercom,
  IntercomProps
} from 'react-use-intercom'
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
  const { user } = useContext(AuthContext)
  useEffect(() => {
    if (router.isReady) {
      const args: IntercomProps = {}
      if (user) {
        args.name = user.name
        args.email = user.email
        args.createdAt = `${Math.ceil(
          new Date(user.created_at).getTime() / 1000
        )}`
      }
      boot(args)
    }
  }, [router.isReady, user])
  return <Component {...pageProps} />
}

export default Fitlink
