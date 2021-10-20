import { NextPageContext } from 'next'
import { DeepLinkType } from '@fitlink/api/src/constants/deep-links'
import { makeApi } from '@fitlink/api-sdk'
import axios from 'axios'
import { Team } from '@fitlink/api/src/modules/teams/entities/team.entity'

const domain = 'https://go.fitlinkapp.com/'
const android = {
  bundle_id: 'app.fitlink'
}
const ios = {
  bundle_id: 'com.fathomux.Fit-Link',
  app_id: '970460487'
}

const Page = () => null

const ax = axios.create({
  baseURL: process.env.API_BASE_URL
    ? process.env.API_BASE_URL + '/api/v1'
    : 'http://localhost:3000/api/v1'
})
const api = makeApi(ax)

//https://go.fitlinkapp.com/?link=https://my.fitlinkapp.com${req.url}&apn=app.fitlink&amv=2.1&afl=https://fitlinkapp.com&d=1
export const getServerSideProps = async function getServerSideProps({
  req
}: NextPageContext) {
  const parse = new URL(req.headers.host + req.url)
  const code = parse.searchParams.get('code')

  if (code) {
    return generateTeamLink(code)
  } else {
    return {
      notFound: true
    }
  }
}

export const generateTeamLink = async (code: string) => {
  let team
  try {
    team = await api.get<Team>('/teams/code/:code', {
      code
    })
  } catch (e) {
    console.error(e)
  }

  if (!team) {
    return {
      notFound: true
    }
  }

  // Use the link in dev and local
  let dev =
    process.env.API_BASE_URL &&
    process.env.API_BASE_URL.indexOf('api-sls.dev') > 0
      ? '&dev=1'
      : ''
  let local = false
  if (!process.env.API_BASE_URL) {
    dev = '&local=1'
    local = true
  }

  const dynamicLinkWithoutFallback = generateDynamicLink(
    DeepLinkType.TeamInvitation,
    {
      avatar_url: team.avatar ? team.avatar.url_128x128 : null,
      name: team.name,
      code: team.join_code
    }
  )

  const dynamicLinkWithFallback = generateDynamicLink(
    DeepLinkType.TeamInvitation,
    {
      avatar_url: team.avatar ? team.avatar.url_128x128 : null,
      name: team.name,
      code: team.join_code
    },
    `${
      local ? 'http://localhost:3001' : 'https://fitlinkapp.com'
    }/join/?code=` +
      code +
      '&url=' +
      encodeURIComponent(dynamicLinkWithoutFallback) +
      dev
  )

  return {
    redirect: {
      permanent: false,
      destination: dynamicLinkWithFallback
    }
  }
}

export const generateDynamicLink = (
  type: string,
  params: { [key: string]: string },
  otherPlatformLink?: string,
  skipAppPreview?: boolean
) => {
  const link = new URL(domain)

  // Add type param to the link
  link.searchParams.append('type', type)

  // Add params to the "link", this URL will be received by the mobile app
  for (const key in params) {
    link.searchParams.append(key, params[key])
  }

  // Construct the dynamic link
  const url = new URL(domain)

  const linkEncoded = encodeURI(link.toString())
  url.searchParams.append('link', linkEncoded)

  // Android values
  url.searchParams.append('apn', android.bundle_id)

  // iOS Values
  url.searchParams.append('ibi', ios.bundle_id)
  url.searchParams.append('isi', ios.app_id)

  if (otherPlatformLink) url.searchParams.append('ofl', otherPlatformLink)
  if (skipAppPreview) url.searchParams.append('efr', '1')

  return url.toString()
}

export default Page
