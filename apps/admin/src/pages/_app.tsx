import { AppProps } from 'next/app'
import { AuthProvider } from '../context/Auth.context'
import '../scss/Main.scss'

function Fitlink({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  )
}

export default Fitlink
