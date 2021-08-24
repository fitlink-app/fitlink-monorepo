import { useContext } from 'react'
import { useRouter } from 'next/dist/client/router'
import MenuItem from './MenuItem'
import IconActivities from '../icons/IconActivities'
import IconCreditCard from '../icons/IconCreditCard'
import IconFriends from '../icons/IconFriends'
import IconGear from '../icons/IconGear'
import IconGraph from '../icons/IconGraph'
import IconLeagues from '../icons/IconLeagues'
import IconRewards from '../icons/IconRewards'
import IconSignOut from '../icons/IconSignOut'
import IconYoga from '../icons/IconYoga'
import { AuthContext } from '../../context/Auth.context'
import Button from '../elements/Button'

const icons = {
  IconActivities,
  IconCreditCard,
  IconFriends,
  IconGear,
  IconGraph,
  IconLeagues,
  IconRewards,
  IconSignOut,
  IconYoga
}

export type MenuProps = {
  label?: string
  link?: string
  icon?: string
  hr?: boolean
  subMenu?: MenuProps[]
  onClick?: () => void
}

export type MainMenuProps = {
  prefix: string
  menu: MenuProps[]
}

export default function MainMenu({ prefix = '', menu = [] }: MainMenuProps) {
  const router = useRouter()
  const current = router.pathname
  const { switchMode, restoreRole } = useContext(AuthContext)

  if (menu.length && !prefix) {
    return (
      <>
        {switchMode ? (
          <div className="top left">
            <a href="#" className="btn small" onClick={() => restoreRole()}>
              Back
            </a>
          </div>
        ) : null}
        {menu.map((item: MenuProps) => {
          const { label, link, icon, onClick, hr, subMenu } = item
          const Icon = icons[icon]
          if (hr) {
            return <hr />
          }

          return (
            <>
              <MenuItem
                to={link}
                onClick={onClick}
                label={label}
                key={label}
                current={current.startsWith(link)}
                icon={Icon ? <Icon /> : null}
              />
              {(subMenu && current.startsWith(link)) ||
              (subMenu &&
                subMenu.filter((e) => current.startsWith(e.link)).length) ? (
                <div className="sub-menu">
                  {subMenu.map((item) => {
                    const { label, link, icon, onClick, hr } = item
                    const Icon = icons[icon]
                    if (hr) {
                      return <hr />
                    }
                    return (
                      <MenuItem
                        to={link}
                        onClick={onClick}
                        label={label}
                        key={label}
                        current={current.startsWith(link)}
                        icon={Icon ? <Icon /> : null}
                      />
                    )
                  })}
                  <hr />
                </div>
              ) : null}
            </>
          )
        })}
      </>
    )
  }

  return (
    <>
      <MenuItem
        to={`${prefix}/dashboard`}
        label="Overview"
        current={current.startsWith(`${prefix}/dashboard`)}
        icon={<IconGraph />}
      />
      <MenuItem
        to={`${prefix}/users`}
        label="Users"
        current={current.startsWith(`${prefix}/users`)}
        icon={<IconFriends />}
      />
      <MenuItem
        to={`${prefix}/rewards`}
        label="Rewards"
        current={current.startsWith(`${prefix}/rewards`)}
        icon={<IconRewards />}
      />
      <MenuItem
        to={`${prefix}/leagues`}
        label="Leagues"
        current={current.startsWith(`${prefix}/leagues`)}
        icon={<IconLeagues />}
      />
      <MenuItem
        to={`${prefix}/activities`}
        label="Activities"
        current={current.startsWith(`${prefix}/activities`)}
        icon={<IconActivities />}
      />
      <hr />
      <MenuItem
        to={`${prefix}/knowledge-base`}
        label="Knowledge base"
        current={current.startsWith(`${prefix}/knowledge-base`)}
        icon={<IconYoga />}
      />
      <MenuItem
        to={`${prefix}/settings`}
        label="Account settings"
        current={current.startsWith(`${prefix}/settings`)}
        icon={<IconGear />}
      />
      {current.startsWith(`${prefix}/settings`) && (
        <div className="sub-menu">
          {/* <MenuItem
            to={`${prefix}/settings/users`}
            label="Manage users"
            current={current.startsWith(`${prefix}/settings/users`)}
            icon={<></>}
          />
          <MenuItem
            to={`${prefix}/settings/page`}
            label="Manage my page"
            current={current.startsWith(`${prefix}/settings/page`)}
            icon={<></>}
          /> */}
          <MenuItem
            to={`${prefix}/settings/admins`}
            label="Admin access"
            current={current.startsWith(`${prefix}/settings/admins`)}
            icon={<></>}
          />
          <hr />
        </div>
      )}
      <MenuItem
        to={`${prefix}/billing`}
        label="Billing"
        current={current.startsWith(`${prefix}/billing`)}
        icon={<IconCreditCard />}
      />
      <hr />
      <MenuItem
        to={`${prefix}/login`}
        label="Sign out"
        icon={<IconSignOut />}
      />
    </>
  )
}
