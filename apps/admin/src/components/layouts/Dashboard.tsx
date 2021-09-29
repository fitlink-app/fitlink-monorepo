import { useRef, useState, useEffect, useContext } from 'react'
import Head from 'next/head'
import Sidebar from '../elements/Sidebar'
import { Toaster } from 'react-hot-toast'
import { AuthContext } from '../../context/Auth.context'
import Button from '../elements/Button'
import Loader from '../elements/Loader'
import LoaderFullscreen from '../elements/LoaderFullscreen'
import Account from '../elements/Account'
import { useRouter } from 'next/router'

type DashboardProps = {
  children?: React.ReactNode
  title?: string
  description?: string
  image?: string
  linkPrefix?: string
  hideSidebar?: boolean
  loading?: boolean
  forceDisplay?: boolean
}

let hydrated = false

export default function Dashboard({
  children,
  title = 'Fitlink',
  description = '',
  linkPrefix = '',
  hideSidebar = false,
  loading = false,
  forceDisplay = false
}: DashboardProps) {
  const hydratedRef = useRef(false)
  const [, rerender] = useState(false)
  const scrollContainer = useRef<HTMLDivElement>()
  const { menu, modeRole } = useContext(AuthContext)
  const { route } = useRouter()

  const url = process.env.URL

  useEffect(() => {
    if (!hydratedRef.current) {
      hydrated = true
      hydratedRef.current = true
      rerender(true)
    }
  }, [])

  useEffect(() => {
    if (scrollContainer.current) {
      document.documentElement.classList.remove('scrolled')
      scrollContainer.current.addEventListener('scroll', scrollEvent)
    }
    return () => {
      if (scrollContainer.current) {
        scrollContainer.current.removeEventListener('scroll', scrollEvent)
      }
    }

    function scrollEvent() {
      if (scrollContainer.current.scrollTop > 20) {
        document.documentElement.classList.add('scrolled')
      } else {
        document.documentElement.classList.remove('scrolled')
      }
    }
  }, [scrollContainer.current, route])

  return (
    <>
      <Head>
        <title>{title} - Fitlink</title>
        <meta charSet="UTF-8" />
        <meta httpEquiv="x-ua-compatible" content="ie=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="google-site-verification"
          content="-SABtmBSc5R69B2lYHBUOHlVLnEoPu8qAOk3VZxZhBk"
        />
        <meta name="description" content={description} />
        <meta
          name="robots"
          content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"
        />
        <link rel="canonical" href={url} />
        <link rel="shortcut icon" href="/img/favicon.png" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          as="style"
          href="https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&display=swap"></link>
        <link
          rel="stylesheet"
          media={!hydrated ? 'print' : 'all'}
          href="https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&display=swap"
        />
      </Head>
      <Toaster
        position="top-right"
        containerClassName="toast-wrapper"
        toastOptions={{
          style: {
            padding: '12px'
          }
        }}
        containerStyle={{
          right: 30
        }}
      />

      {(!modeRole || loading) && !forceDisplay ? (
        <LoaderFullscreen />
      ) : (
        <>
          <div className="layout-dashboard">
            {!hideSidebar && <Sidebar prefix={linkPrefix} menu={menu} />}
            <div className="content" ref={scrollContainer}>
              {!hideSidebar && <Account />}
              {children}
            </div>
          </div>
          <div id="modal-root"></div>
        </>
      )}
    </>
  )
}
