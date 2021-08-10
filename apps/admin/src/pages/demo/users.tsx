import { AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import Drawer from '../../components/elements/Drawer'
import InviteUser from '../../components/forms/InviteUser'
import ImportUsers from '../../components/forms/ImportUsers'
import Dashboard from '../../components/layouts/Dashboard'
import TableContainer from '../../components/Table/TableContainer'
import { boolToIcon } from '../../components/Table/helpers'
import IconApple from '../../components/icons/IconApple'
import IconAndroid from '../../components/icons/IconAndroid'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const dummy = require('../../services/dummy/team-users.json')

const deviceIcon = ({ value }) => {
  if (value === 'ios')
    return (
      <IconApple width="24" height="24" />
    )
  else if (value === 'android')
    return (
      <IconAndroid width="24" height="24" />
    )
  return value
}

const trackerLogo = ({value}) => {
  return (
    <>
      {value.map(v => <img src={`/img/${v}.png`} alt={v} title={v} className="tracker-logo" />)}
    </>
  )
}

export default function page() {
  const [drawContent, setDrawContent] = useState<
    React.ReactNode | undefined | false
  >(false)
  const [warning, setWarning] = useState(false)
  const [wide, setWide] = useState(false)

  const InviteUserForm = () => {
    setWarning(true)
    setWide(false)
    setDrawContent(<InviteUser />)
  }

  const EditUserForm = (firstName, lastName, email) => {
    setWarning(true)
    setWide(false)
    setDrawContent(
      <InviteUser
        current={{ firstName: firstName, lastName: lastName, email: email }}
      />
    )
  }

  const ImportUsersForm = () => {
    setWarning(true)
    setWide(true)
    setDrawContent(<ImportUsers />)
  }

  const showAvatar = ({
    cell: {
      row: {
        original: { avatar, firstName, lastName }
      }
    }
  }) => {
    return (
      <div className="avatar">
        <span>{`${firstName[0]}${lastName[0]}`}</span>
        {avatar && <img src={avatar} alt={`${firstName[0]}${lastName[0]}`} />}
      </div>
    )
  }

  const cellActions = ({
    cell: {
      row: {
        original: { firstName, lastName, email }
      }
    }
  }) => (
    <div className="text-right">
      <button className="button alt small">Delete</button>
      <button
        className="button small ml-1"
        onClick={() => EditUserForm(firstName, lastName, email)}>
        Edit
      </button>
    </div>
  )

  return (
    <Dashboard title="Settings Users" linkPrefix="/demo">
      <div className="flex ai-c">
        <h1 className="light mb-0 mr-2">Manage users</h1>
        <button className="button alt small mt-1" onClick={InviteUserForm}>
          Invite
        </button>
        <button
          className="button alt small mt-1 ml-1"
          onClick={ImportUsersForm}>
          Bluk import
        </button>
      </div>

      <div className="mt-4 overflow-x-auto">
        <TableContainer
          columns={[
            { Header: ' ', accessor: 'avatar', Cell: showAvatar },
            { Header: 'First Name', accessor: 'firstName' },
            { Header: 'Last Name', accessor: 'lastName' },
            { Header: 'Email', accessor: 'email' },
            { Header: 'Registered', accessor: 'registered', Cell: boolToIcon },
            /* { Header: 'Mobile OS', accessor: 'mobile_os', Cell: deviceIcon }, */
            { Header: 'Tracker', accessor: 'tracker', Cell: trackerLogo },
            { Header: ' ', Cell: cellActions }
          ]}
          fetch={() => Promise.resolve(dummy)}
          fetchName="manage_users"
        />
      </div>

      <AnimatePresence initial={false}>
        {drawContent && (
          <Drawer
            remove={() => setDrawContent(null)}
            key="drawer"
            warnBeforeClose={warning}
            wide={wide}>
            {drawContent}
          </Drawer>
        )}
      </AnimatePresence>
    </Dashboard>
  )
}



/* import { useState } from 'react'
import Dashboard from '../../components/layouts/Dashboard'
import TableContainer from '../../components/Table/TableContainer'
import {
  toChipCell,
  toDateCell,
  toLocaleCell
} from '../../components/Table/helpers'
import Drawer from '../../components/elements/Drawer'
import Link from 'next/link'
import IconSearch from '../../components/icons/IconSearch'
import UserStats from '../../components/forms/UserStats'
import { AnimatePresence } from 'framer-motion'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const dummy = require('../../services/dummy/users.json')

export default function page() {
  const [drawContent, setDrawContent] = useState<
    React.ReactNode | undefined | false
  >(false)

  const displayImage = ({
    cell: {
      row: {
        original: { avatar, initials }
      }
    }
  }) => {
    return (
      <div className="bua">
        <img src={avatar} alt="User avatar" />
        <span>{initials}</span>
      </div>
    )
  }

  const viewDetails = ({
    cell: {
      row: {
        original: {
          date_joined,
          mobile_os,
          tracker,
          points,
          rank,
          last_activity,
          total_leagues,
          rewards,
          last_session,
          created_leagues
        }
      }
    }
  }) => {
    return (
      <button
        className="icon-button"
        onClick={() => {
          setDrawContent(
            <UserStats
              date_joined={date_joined}
              mobile_os={mobile_os}
              tracker={tracker}
              points={points}
              rank={rank}
              last_activity={last_activity}
              total_leagues={total_leagues}
              rewards={rewards}
              last_session={last_session}
              created_leagues={created_leagues}
            />
          )
        }}>
        <IconSearch />
      </button>
    )
  }

  return (
    <Dashboard title="Users" linkPrefix="/demo">
      <div className="row ai-c">
        <div className="col">
          <h1 className="light mb-0">User performance</h1>
        </div>
        <div className="col text-right">
          <Link href="/demo/settings/users">
            <a className="button alt">Manage users</a>
          </Link>
        </div>
      </div>
      <p className="mt-1">
        To comply with GDPR regulations, user information is anonymous.
      </p>
      <div className="mt-4 overflow-x-auto">
        <TableContainer
          columns={[
            { Header: 'User', accessor: 'avatar', Cell: displayImage },
            {
              Header: 'Date Joined',
              accessor: 'date_joined',
              Cell: toDateCell
            },
            { Header: 'Mobile OS', accessor: 'mobile_os' },
            { Header: 'Tracker', accessor: 'tracker' },
            { Header: 'Total Points', accessor: 'points', Cell: toLocaleCell },
            { Header: 'Rank', accessor: 'rank', Cell: toChipCell },
            { Header: 'Last activity', accessor: 'last_activity' },
            { Header: 'Total leagues', accessor: 'total_leagues' },
            {
              Header: 'Reward redeemed',
              accessor: 'rewards',
              Cell: toLocaleCell
            },
            { Header: ' ', Cell: viewDetails }
          ]}
          fetch={() => Promise.resolve(dummy)}
          fetchName="users"
        />
      </div>
      <AnimatePresence initial={false}>
        {drawContent && (
          <Drawer remove={() => setDrawContent(null)} key="drawer">
            {drawContent}
          </Drawer>
        )}
      </AnimatePresence>
    </Dashboard>
  )
}
 */