import IconActivities from '../icons/IconActivities'
import IconCreditCard from '../icons/IconCreditCard'
import IconFriends from '../icons/IconFriends'
import IconGear from '../icons/IconGear'
import IconGraph from '../icons/IconGraph'
import IconLeagues from '../icons/IconLeagues'
import IconRewards from '../icons/IconRewards'
import IconSignOut from '../icons/IconSignOut'
import IconYoga from '../icons/IconYoga'
import Logo from './Logo'
import MenuItem from './MenuItem'

export type SidebarProps = {
  superAdmin?: boolean
}

export default function Sidebar({
  superAdmin = false,
}: SidebarProps) {
  return(
    <div className="sidebar">
      <Logo />
      <div className="sidebar__menu">
        { !superAdmin &&
          <>
            <MenuItem
              to="/"
              label="Overview"
              icon={ <IconGraph /> }
              />
            <MenuItem
              to="/users"
              label="Users"
              icon={ <IconFriends /> }
              />
            <MenuItem
              to="/rewards"
              label="Rewards"
              icon={ <IconRewards /> }
              />
            <MenuItem
              to="/leagues"
              label="Leagues"
              icon={ <IconLeagues /> }
              />
            <MenuItem
              to="/activities"
              label="Activities"
              icon={ <IconActivities /> }
              />
            <hr />
            <MenuItem
              to="/knowledge-base"
              label="Knowledge base"
              icon={ <IconYoga /> }
              />
            <hr />
            <MenuItem
              to="/settings"
              label="Account settings"
              icon={ <IconGear /> }
              />
            <MenuItem
              to="/billing"
              label="Billing"
              icon={ <IconCreditCard /> }
              />
            <hr />
            <MenuItem
              to="/logout"
              label="Sign out"
              icon={ <IconSignOut /> }
              />
          </>
        }
      </div>
    </div>
  )
}