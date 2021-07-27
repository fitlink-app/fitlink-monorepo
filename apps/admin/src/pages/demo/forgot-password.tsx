import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Input from '../../components/elements/Input'
import Logo from '../../components/elements/Logo'
import Login from '../../components/layouts/Login'
import Feedback from '../../components/elements/Feedback'
import IconArrowRight from '../../components/icons/IconArrowRight'

export default function page() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleLogin = (e) => {
    e.preventDefault()
    const email = e.target.elements.email.value
    if (email !== '') {
      e.target.elements.email.value = ''
      setLoading(true)
      setMessage('')
      setLoading(false)
      setMessage('If the e-mail address is registered, instructions will be sent to reset your password')
    }
  }

  return (
    <Login title="Forgot Password">
      <div className="text-center">
        <Logo
          height={32}
        />
        <h1 className="h6 mt-2 color-grey">Enter your email address to reset your password</h1>
      </div>
      <form onSubmit={ handleLogin } className="mt-2">
        <Input
          label="E-mail address"
          name="email"
          type="email"
          />
        { message !== '' &&
          <Feedback
            type="success"
            className="mt-2"
            message={message} />
        }
        <div className="row ai-c mt-2">
          <div className="col">
            <Link href="/demo/login">
              <a className="small-link inline-block">
                Login here
                <IconArrowRight />
              </a>
            </Link>
          </div>
          <div className="col text-right">
            <button className="button" disabled={loading}>Send reset e-mail</button>
          </div>
        </div>
      </form>
    </Login>
  )
}
