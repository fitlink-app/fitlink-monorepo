import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Input from '../../components/elements/Input'
import Logo from '../../components/elements/Logo'
import Login from '../../components/layouts/Login'
import Feedback from '../../components/elements/Feedback'
import IconArrowRight from '../../components/icons/IconArrowRight'
import IconApple from '../../components/icons/IconApple'
import IconGoogle from '../../components/icons/IconGoogle'

export default function page() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const email = e.target.elements.email.value
    const password = e.target.elements.password.defaultValue
    if (email === 'demo@fitlinkapp.com' && password === 'demo') {
      router.push('/demo/dashboard')
    } else {
      setLoading(false)
      setError('Invalid email address or password')
    }
  }

  return (
    <Login title="Login">
      <div className="text-center">
        <Logo
          height={32}
        />
        <h1 className="h6 mt-2 color-grey">Manage your Fitlink team</h1>
      </div>
      <form onSubmit={ handleLogin } className="mt-2">
        <Input
          label="E-mail address"
          name="email"
          type="email"
          inline={true}
          />   
        <Input
          label="Password"
          name="password"
          type="password"
          inline={true}
          />
        
        { error !== '' &&
          <Feedback
            type="error"
            className="mt-2"
            message={error} />
        }
        <div className="row ai-c mt-2">
          <div className="col">
            <Link href="/demo/forgot-password">
              <a className="small-link inline-block">
                Forgot password
                <IconArrowRight />
              </a>
            </Link>
          </div>
          <div className="col text-right">
            <button className="button" disabled={loading}>Login</button>
          </div>
        </div>
      </form>

      <div className="text-center">
        <div className="or">Or</div>
        <button className="button alt block mb-1">
          <IconApple className="mr-1" />
          Login with Apple
        </button>
        <button className="button alt block">
          <IconGoogle className="mr-1" />
          Login with Google
        </button>
      </div>
    </Login>
  )
}
