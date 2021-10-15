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
import Head from 'next/head'

const queryClient = new QueryClient()

function Fitlink(appProps: AppProps) {
  return (
    <ErrorBoundary>
      <GoogleAnalytics />
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
  const { boot, update } = useIntercom()
  const router = useRouter()
  const { user, team } = useContext(AuthContext)

  useEffect(() => {
    if (router.isReady) {
      boot()
    }
  }, [router.isReady])

  useEffect(() => {
    console.log(team)
  }, [team])

  useEffect(() => {
    if (router.isReady) {
      const args: IntercomProps = {}
      if (user) {
        args.name = user.name
        args.email = user.email
        args.userId = user.id
        args.createdAt = `${Math.ceil(
          new Date(user.created_at).getTime() / 1000
        )}`

        if (team) {
          args.company = {
            companyId: team.id,
            name: team.name,
            userCount: team.user_count,
            createdAt: (team.created_at as any) as string
          }
        }

        update(args)
      }
    }
  }, [router.isReady, user, team])
  return <Component {...pageProps} />
}

function GoogleAnalytics() {
  return (
    <Head>
      <script
        async
        src="https://www.googletagmanager.com/gtag/js?id=G-H8ZKMENXV4"></script>
      <script
        dangerouslySetInnerHTML={{
          __html: `
          <!-- Global site tag (gtag.js) - Google Analytics -->
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-H8ZKMENXV4');
        `
        }}
      />
    </Head>
  )
}

export default Fitlink
