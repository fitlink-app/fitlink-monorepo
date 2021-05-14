import { AppProps } from 'next/app'
import { AuthProvider } from '../context/Auth.context'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  )
}
