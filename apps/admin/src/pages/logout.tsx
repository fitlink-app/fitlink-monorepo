import { useContext, useEffect } from 'react'
import { AuthContext } from '../context/Auth.context'
import { useRouter } from 'next/router'

const Logout = () => {
  const router = useRouter()
  const { api } = useContext(AuthContext)

  useEffect(() => {
    ;(async function () {
      await api.logout()
      router.push('/login')
    })()
  }, [])

  return null
}

export default Logout
