import { NextPageContext } from 'next'

const Page = () => null

export const getServerSideProps = async function getServerSideProps({
  req
}: NextPageContext) {
  return {
    redirect: {
      permanent: false,
      destination: `https://fitlink.page.link/?link=https://my.fitlinkapp.com${req.url}&apn=app.fitlink&amv=2.1&afl=https://fitlinkapp.com&d=1`
    }
  }
}

export default Page
