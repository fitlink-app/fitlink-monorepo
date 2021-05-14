import type { AppProps } from 'next/app'
import '../scss/Main.scss'

function Fitlink({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}

export default Fitlink
