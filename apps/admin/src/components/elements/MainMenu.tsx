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
        to="/dashboard"
        label="Overview"
        current={current === '/dashboard'}
        icon={ <IconGraph /> }
        />
      <MenuItem
        to="/users"
        label="Users"
        current={current === '/users'}
        icon={ <IconFriends /> }
        />
      <MenuItem
        to="/rewards"
        label="Rewards"
        current={current === '/rewards'}
        icon={ <IconRewards /> }
        />
      <MenuItem
        to="/leagues"
        label="Leagues"
        current={current === '/leagues'}
        icon={ <IconLeagues /> }
        />
      <MenuItem
        to="/activities"
        label="Activities"
        current={current === '/activities'}
        icon={ <IconActivities /> }
        />
      <hr />
      <MenuItem
        to="/knowledge-base"
        label="Knowledge base"
        current={current === '/knowledge-base'}
        icon={ <IconYoga /> }
        />
      <hr />
      <MenuItem
        to="/settings"
        label="Account settings"
        current={current === '/settings'}
        icon={ <IconGear /> }
        />
      <MenuItem
        to="/billing"
        label="Billing"
        current={current === '/billing'}
        icon={ <IconCreditCard /> }
        />
      <hr />
      <MenuItem
        to="/logout"
        label="Sign out"
        icon={ <IconSignOut /> }
        />
    </>
  )
}