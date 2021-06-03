import React, { useEffect, useState } from 'react'
import { format } from 'date-fns'
import Dashboard from '../components/layouts/Dashboard'
import TableContainer from '../components/table/TableContainer'
import { toChipCell, toDateCell, toLocaleCell } from '../components/table/helpers'
import Drawer from '../components/elements/Drawer'
import Link from 'next/link'
import Input from '../components/elements/Input'
import IconSearch from '../components/icons/IconSearch'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const dummy = require('../services/dummy/users.json')

export default function users() {
  const [drawContent, setDrawContent] = useState<React.ReactNode | undefined | false>(false)
  const [userMsg, setUserMsg] = useState('')

  useEffect(() => {
    console.log('updated', userMsg)
  }, [userMsg])

  const sendMessage = () => {
    console.log(userMsg)
  }
  
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
      <button className="icon-button" onClick={() => {
        setDrawContent(
          <div className="">
            <h4 className="light mb-3">User details</h4>
            <Input
              label="Send this user a message"
              name="message"
              value={userMsg}
              type="textarea"
              changed={ setUserMsg }
              />
            <div className="text-right mb-3">
              <button onClick={ sendMessage } className="button">Send</button>
            </div>
            <h6>Date joined</h6>
            <p>{ format(new Date(date_joined), 'yyyy-MM-dd H:m:s OOOO') }</p>
            <hr className="tight" />
            <h6>Mobile operating system</h6>
            <p>{ mobile_os }</p>
            <hr className="tight" />
            <h6>Connected trackers</h6>
            <p>{ tracker }</p>
            <hr className="tight" />
            <h6>Last app session</h6>
            <p>{ format(new Date(last_session), 'yyyy-MM-dd H:m:s OOOO') }</p>
            <hr className="tight" />
            <h6>Total points</h6>
            <p>{ points }</p>
            <hr className="tight" />
            <h6>Rank</h6>
            <p>{ rank }</p>
            <hr className="tight" />
            <h6>Last activity tracked</h6>
            <p>{ last_activity }</p>
            <hr className="tight" />
            <h6>Leagues joined</h6>
            <p>{ total_leagues }</p>
            <hr className="tight" />
            <h6>Leagues created</h6>
            <p>{ created_leagues }</p>
            <hr className="tight" />
            <h6>Rewards redeemed</h6>
            <p>{ rewards }</p>
          </div>
        )
      }}>
        <IconSearch width="24px" height="24px" />
      </button>
    )
  }

  return (
    <Dashboard
      title="Users"
      >
      <div className="row ai-c">
        <div className="col">
          <h1 className="light mb-0">User performance</h1>
        </div>
        <div className="col text-right">
          <Link href="/settings/users">
            <a className="button alt">Manage users</a>
          </Link>
        </div>
      </div>
      <p className="mt-1">To comply with GDPA regulations, user information is annonymous.</p>
      <div className="mt-4 overflow-x-auto">
        <TableContainer
          columns={[
            { Header: 'User', accessor: 'avatar', Cell: displayImage },
            { Header: 'Date Joined', accessor: 'date_joined', Cell: toDateCell },
            { Header: 'Mobile OS', accessor: 'mobile_os' },
            { Header: 'Tracker', accessor: 'tracker' },
            { Header: 'Total Points', accessor: 'points', Cell: toLocaleCell },
            { Header: 'Rank', accessor: 'rank', Cell: toChipCell },
            { Header: 'Last activity', accessor: 'last_activity' },
            { Header: 'Total leagues', accessor: 'total_leagues' },
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