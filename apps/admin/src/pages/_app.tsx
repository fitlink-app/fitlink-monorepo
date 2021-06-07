import { AppProps } from 'next/app'
import { AuthProvider } from '../context/Auth.context'
import { QueryClient, QueryClientProvider } from 'react-query'
import '../scss/Main.scss'

const queryClient = new QueryClient()

function Fitlink({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default Fitlink
