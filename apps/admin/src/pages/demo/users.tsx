/*

TODO:
sort table

*/

import { useState } from 'react'
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

export default function users() {
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
