import { useRouter } from 'next/router'
import { useEffect } from 'react'
import Dashboard from '../components/layouts/Dashboard'

const IndexPage = () => {
  const router = useRouter()

  useEffect(() => {
    router.push('/login')
  }, [])

  return <Dashboard hideSidebar={true} />
}

export default IndexPage
