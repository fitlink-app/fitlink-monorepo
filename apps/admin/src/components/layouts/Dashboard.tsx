import { useRef, useState, useEffect } from 'react'
import Head from 'next/head'
import Sidebar from '../elements/Sidebar'

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
  description = '',
  //image = '/img/fitlink-og.png'
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
        <title>{title}</title>
        <meta charSet="UTF-8" />
        <meta httpEquiv="x-ua-compatible" content="ie=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="google-site-verification" content="-SABtmBSc5R69B2lYHBUOHlVLnEoPu8qAOk3VZxZhBk" />
        <meta name="description" content={description} />
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        {/* <meta property="og:locale" content="en_GB" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={url} />
        <meta property="og:site_name" content="Fitlink" />
        <meta property="article:publisher" content="https://www.facebook.com/fitlinkapp" />
        <meta property="article:modified_time" content="2021-01-22T15:24:12+00:00" />
        <meta property="og:image" content={image} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@fitlinkapp" /> */}
        <link rel="canonical" href={url} />
        <link rel="shortcut icon" href="/img/favicon.png" />

        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" /> 
        <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&display=swap"></link>
        <link rel="stylesheet" media={!hydrated ? "print" : "all"} href="https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&display=swap" />
      </Head>
      
      <div className="layout-dashboard">
        <Sidebar />
        <div className="content">
          {children}
        </div>
      </div>
    </>
  )
}