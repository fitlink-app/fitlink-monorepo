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

export default function MainMenu() {
  const router = useRouter()
  const current = router.pathname
  return (
    <>
      <MenuItem
        to="/demo/dashboard"
        label="Overview"
        current={current.startsWith('/demo/dashboard')}
        icon={<IconGraph />}
      />
      <MenuItem
        to="/demo/users"
        label="User stats"
        current={current.startsWith('/demo/users')}
        icon={<IconFriends />}
      />
      <MenuItem
        to="/demo/rewards"
        label="Rewards"
        current={current.startsWith('/demo/rewards')}
        icon={<IconRewards />}
      />
      <MenuItem
        to="/demo/leagues"
        label="Leagues"
        current={current.startsWith('/demo/leagues')}
        icon={<IconLeagues />}
      />
      <MenuItem
        to="/demo/activities"
        label="Activities"
        current={current.startsWith('/demo/activities')}
        icon={<IconActivities />}
      />
      <hr />
      <MenuItem
        to="/demo/knowledge-base"
        label="Knowledge base"
        current={current.startsWith('/demo/knowledge-base')}
        icon={<IconYoga />}
      />
      <MenuItem
        to="/demo/settings"
        label="Account settings"
        current={current.startsWith('/demo/settings')}
        icon={<IconGear />}
      />
      {current.startsWith('/demo/settings') &&
        <div className="sub-menu">
          <MenuItem
            to="/demo/settings/users"
            label="Manage users"
            current={current.startsWith('/demo/settings/users')}
            icon={<></>}
          />
          {/* <MenuItem
            to="/demo/settings/page"
            label="Manage my page"
            current={current.startsWith('/demo/settings/page')}
            icon={<></>}
          /> */}
          <MenuItem
            to="/demo/settings/admins"
            label="Admin access"
            current={current.startsWith('/demo/settings/admins')}
            icon={<></>}
          />
          <hr />
        </div>
      }
      <MenuItem
        to="/demo/billing"
        label="Billing"
        current={current.startsWith('/demo/billing')}
        icon={<IconCreditCard />}
      />
      <hr />
      <MenuItem to="/demo/login" label="Sign out" icon={<IconSignOut />} />
    </>
  )
}
