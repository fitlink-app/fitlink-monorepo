import Select from './Select'
import useRoles from '../../hooks/api/useRoles'
import { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../../context/Auth.context'
import { Roles } from '@fitlink/api/src/modules/user-roles/user-roles.constants'
import IconRepeat from '../icons/IconRepeat'
import toast from 'react-hot-toast'
import IconCreditCard from '../icons/IconCreditCard'
import IconSettings from '../icons/IconSettings'
import IconFriends from '../icons/IconFriends'

const icons = {
  Subscription: IconCreditCard,
  Organisation: IconSettings,
  Team: IconFriends,
  'Super Admin': IconSettings
}

export function RoleSwitcher() {
  const { switchRole, currentRole, currentRoleId } = useContext(AuthContext)
  const [value, setValue] = useState(null)
  const { roles } = useRoles()
  const [show, setShow] = useState(false)

  useEffect(() => {
    // toast.loading(<b>Switching role...</b>)
  }, [])

  return (
    <div className="role-switcher">
      <a
        className={`role-switcher__manage ${show ? 'in' : ''}`}
        href="#"
        onClick={() => setShow(!show)}>
        Switch Account <IconRepeat viewBox="0 0 512 512" className="ml-1" />
      </a>
      {show && (
        <div className="role-switcher__roles">
          {roles.map(({ role, id, type, name }) => {
            const Icon = icons[type]
            return (
              <span>
                <a
                  href="#"
                  onClick={() => {
                    toast.loading(<b>Switching role...</b>)
                    setShow(false)
                    switchRole({
                      id,
                      role
                    }).finally(() => {
                      toast.dismiss()
                    })
                    setValue(null)
                  }}>
                  <Icon className="mr-1" />
                  {name}
                </a>
              </span>
            )
          })}
        </div>
      )}
    </div>
  )
}
