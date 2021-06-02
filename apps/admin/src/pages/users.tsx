import React, { useState } from 'react'
import { format } from 'date-fns'
import Dashboard from '../components/layouts/Dashboard'
import TableContainer from '../components/table/TableContainer'
import { toChipCell, toDateCell, toLocaleCell } from '../components/table/helpers'
import Drawer from '../components/elements/Drawer'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const dummy = require('../services/dummy/users.json')

export default function components() {
  const [drawContent, setDrawContent] = useState<React.ReactNode | undefined | false>(false)
  
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
      <button onClick={() => {
        setDrawContent(
          <div className="">
            <h4>Date joined</h4>
            <p>{ format(new Date(date_joined), 'yyyy-MM-dd H:m:s OOOO') }</p>
            <h4>Mobile operating system</h4>
            <p>{ mobile_os }</p>
            <h4>Connected trackers</h4>
            <p>{ tracker }</p>
            <h4>Last app session</h4>
            <p>{ format(new Date(last_session), 'yyyy-MM-dd H:m:s OOOO') }</p>
            <h4>Total points</h4>
            <p>{ points }</p>
            <h4>Rank</h4>
            <p>{ rank }</p>
            <h4>Last activity tracked</h4>
            <p>{ last_activity }</p>
            <h4>Leagues joined</h4>
            <p>{ total_leagues }</p>
            <h4>Leagues created</h4>
            <p>{ created_leagues }</p>
            <h4>Rewards redeemed</h4>
            <p>{ rewards }</p>
          </div>
        )
      }}>View</button>
    )
  }

  return (
    <Dashboard
      title="Users"
      >
      <h1 className="light">User performance</h1>
      <p>To comply with GDPA regulations, user information is annonymous.</p>
      <div className="mt-4">
      <TableContainer
        columns={[
          { Header: 'User', accessor: 'avatar', Cell: displayImage },
          { Header: 'Date Joined', accessor: 'date_joined', Cell: toDateCell },
          { Header: 'Mobile OS', accessor: 'mobile_os' },
          { Header: 'Tracker', accessor: 'tracker' },
          { Header: 'Total Points', accessor: 'points', Cell: toLocaleCell },
          { Header: 'Rank', accessor: 'rank', Cell: toChipCell },
          //{ Header: 'Last app session', accessor: 'last_session', Cell: toDateCell },
          { Header: 'Last activity', accessor: 'last_activity' },
          { Header: 'Total leagues', accessor: 'total_leagues' },
          //{ Header: 'Leagues created', accessor: 'created_leagues' },
          { Header: 'Reward redeemed', accessor: 'rewards', Cell: toLocaleCell },
          { Header: 'View', Cell: viewDetails }
        ]}
        fetch={() =>
          Promise.resolve(dummy)
        }
        />
      </div>
      <Drawer>
        { drawContent }
      </Drawer>
    </Dashboard>
  )
}
/*
OS or Android
Version they have installed
Trackers they have connected
Total points
Date joined
Last app session
Last activity tracked
How many leagues they are in
How many leagues they created
How many rewards they redeemed
What rewards they redeemed
How many activities they created
*/