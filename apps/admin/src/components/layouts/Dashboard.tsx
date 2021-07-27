import { useRef, useState, useEffect } from 'react'
import Head from 'next/head'
import Sidebar from '../elements/Sidebar'
import { Toaster } from 'react-hot-toast'

type DashboardProps = {
  children: React.ReactNode
  title?: string
  description?: string
  image?: string
}

let hydrated = false

export default function Dashboard({
  children,
  title = 'Fitlink',
  description = ''
}:DashboardProps) {

  const hydratedRef = useRef(false);
  const [, rerender] = useState(false);

  const url = process.env.URL

  useEffect(() => {
    if (!hydratedRef.current) {
      hydrated = true
      hydratedRef.current = true
      rerender(true)
    }
  }, [])

  return (
    <>
      <Head>
        <title>{title} - Fitlink</title>
        <meta charSet="UTF-8" />
        <meta httpEquiv="x-ua-compatible" content="ie=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="google-site-verification" content="-SABtmBSc5R69B2lYHBUOHlVLnEoPu8qAOk3VZxZhBk" />
        <meta name="description" content={description} />
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <link rel="canonical" href={url} />
        <link rel="shortcut icon" href="/img/favicon.png" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" /> 
        <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&display=swap"></link>
        <link rel="stylesheet" media={!hydrated ? "print" : "all"} href="https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&display=swap" />
      </Head>
      <Toaster
        position="top-right"
        />
      <div className="layout-dashboard">
        <Sidebar />
        <div className="content">
          {children}
        </div>
      </div>
      <div id="modal-root"></div>
    </>
  )
}