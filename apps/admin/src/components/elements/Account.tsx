import Link from 'next/link'
import { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../../context/Auth.context'
import IconGear from '../icons/IconGear'
import { RoleSwitcher } from './RoleSwitcher'

export default function Account() {
  const { user } = useContext(AuthContext)
  const [display, setDisplay] = useState({ display: 'flex' })

  if (!user) {
    return null
  }

  const [f, l] = user.name.split(' ')

  return user ? (
    <div className="account" style={display}>
      <RoleSwitcher />
      <Link href="/settings/profile">
        <div className="flex ai-c">
          <div className="avatar pointer">
            {!user.avatar && <span>{`${f[0]}${l ? l[0] : ''}`}</span>}
            {user.avatar && (
              <img src={user.avatar.url_128x128} alt={user.name} />
            )}
          </div>
          <span className="ml-1 pointer">{user.name}</span>
        </div>
      </Link>
    </div>
  ) : null
}
