import { useContext } from 'react'
import { useRouter, Router, NextRouter } from 'next/dist/client/router'
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
import IconInfo from '../icons/IconInfo'
import IconMobile from '../icons/IconMobile'
import IconExternal from '../icons/IconExternal'
import IconEvents from '../icons/IconEvents'
import IconNews from '../icons/IconNews'

const icons = {
  IconActivities,
  IconCreditCard,
  IconFriends,
  IconGear,
  IconGraph,
  IconLeagues,
  IconRewards,
  IconSignOut,
  IconYoga,
  IconInfo,
  IconMobile,
  IconExternal,
  IconEvents,
  IconNews
}

export type MenuProps = {
  label?: string
  link?: string
  icon?: string
  id?: string
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

  if (menu.length && !prefix) {
    return (
      <div>
        {menu.map((item: MenuProps, index: number) => {
          const { label, link, icon, onClick, hr, subMenu, id } = item
          const Icon = icons[icon]
          if (hr) {
            return <hr key={index} />
          }

          return (
            <div key={index}>
              <MenuItem
                to={link}
                id={id}
                onClick={onClick}
                label={label}
                current={startsWith(router, link)}
                icon={Icon ? <Icon /> : null}
                endIcon={
                  link.indexOf('http') === 0 ? (
                    <IconExternal className="end-icon" />
                  ) : null
                }
              />
              {(subMenu && startsWith(router, link)) ||
              (subMenu &&
                subMenu.filter((e) => startsWith(router, e.link)).length) ? (
                <div className="sub-menu">
                  {subMenu.map((item, index) => {
                    const { label, link, icon, onClick, hr, id } = item
                    const Icon = icons[icon]
                    if (hr) {
                      return <hr key={index} />
                    }
                    return (
                      <MenuItem
                        to={link}
                        id={id}
                        onClick={onClick}
                        label={label}
                        key={index}
                        current={startsWith(router, link)}
                        icon={Icon ? <Icon /> : null}
                      />
                    )
                  })}
                  <hr />
                </div>
              ) : null}
            </div>
          )
        })}
      </div>
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
      <MenuItem
        to={`${prefix}/events`}
        label="Events"
        current={current.startsWith(`${prefix}/events`)}
        icon={<IconEvents />}
      />
      <MenuItem
        to={`${prefix}/news`}
        label="News"
        current={current.startsWith(`${prefix}/news`)}
        icon={<IconNews />}
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

const startsWith = (router: NextRouter, link: string) => {
  let pathname = router.pathname
  Object.keys(router.query).map((k) => {
    pathname = pathname.replace(`[${k}]`, router.query[k] as string)
  })
  return pathname.startsWith(link)
}
