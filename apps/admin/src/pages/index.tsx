import { useRouter } from 'next/router'
import { useEffect } from 'react'

const IndexPage = () => {
  const router = useRouter()

  useEffect(() => {
    router.push('/login')
  }, [])

  return null
}

export default IndexPage
