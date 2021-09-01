import { useContext, useEffect } from 'react'
import { AuthContext } from '../context/Auth.context'
import { useRouter } from 'next/router'

const Logout = () => {
  const router = useRouter()
  const { api, logout } = useContext(AuthContext)

  useEffect(() => {
    ;(async function () {
      await logout()
      location.href = '/login'
    })()
  }, [])

  return null
}

export default Logout
