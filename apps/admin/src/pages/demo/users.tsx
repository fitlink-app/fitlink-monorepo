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
import Checkbox from '../../components/elements/Checkbox'
import Button from '../../components/elements/Button'
import Input from '../../components/elements/Input'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const dummy = require('../../services/dummy/users.json')

export default function page() {
  const [drawContent, setDrawContent] = useState<
    React.ReactNode | undefined | false
  >(false)

  const [selected, setSelected] = useState([])

  const [searchTerm, setSearchTerm] = useState('')

  const displayCheckbox = ({
    cell: {
      row: {
        original: { id }
      }
    }
  }) => {
    return (
      <Checkbox
        name={`user-${id}`}
        showSwitch={false}
        className="noLabel"
        checked={selected.includes(id)}
        onChange={() => {
          setSelected((selected) => {
            if (selected.includes(id)) {
              return [...selected.filter((s) => s !== id)]
            } else {
              return [...selected, id]
            }
          })
        }}
      />
    )
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
    <Dashboard title="Users">
      <div className="row ai-c">
        <div className="col">
          <h1 className="light mb-0">User performance</h1>
        </div>
        <div className="col text-right">
          <input
            name="search-table"
            placeholder="Search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            style={{
              margin: 0,
              paddingTop: 0,
              paddingBottom: 0,
              verticalAlign: 'middle'
            }}
          />

          <Button
            className="ml-3 mr-3"
            label="Send message"
            alt
            onClick={() => {
              setDrawContent(<SendMessage />)
            }}
          />

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
            {
              Header: ({}) => {
                return (
                  <Checkbox
                    name="select-all"
                    showSwitch={false}
                    className="noLabel"
                    checked={selected.length === dummy.results.length}
                    onChange={() => {
                      if (selected.length === dummy.results.length) {
                        setSelected([])
                      } else {
                        setSelected([...dummy.results.map((d) => d.id)])
                      }
                    }}
                    style={{ verticalAlign: 'middle' }}
                  />
                )
              },
              accessor: 'selected',
              Cell: displayCheckbox,
              disableSortBy: true
            },
            { Header: 'User', accessor: 'avatar', Cell: displayImage },
            {
              Header: 'Date Joined',
              accessor: 'date_joined',
              Cell: toDateCell
            },
            { Header: 'Location', accessor: 'location' },
            { Header: 'Teams', accessor: 'teams' },
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
            { Header: ' ', Cell: viewDetails, disableSortBy: true }
          ]}
          fetch={() => Promise.resolve(dummy)}
          searchTerm={searchTerm}
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

export const SendMessage = () => {
  const [userMsg, setUserMsg] = useState('')
  const [response, setResponse] = useState('')

  const [email, setEmail] = useState(true)
  const [notification, setNotification] = useState(true)

  const sendMessage = () => {
    console.log(userMsg)
    // send message
    setResponse('Your message has been sent')
    setUserMsg('')
  }

  return (
    <>
      <Input
        label="Send users a message"
        name="message"
        value={userMsg}
        type="textarea"
        onChange={(e) => {
          setUserMsg(e)
          setResponse('')
        }}
      />

      <div style={{ display: 'flex' }}>
        <Checkbox
          label="Email"
          name="email"
          checked={email}
          showSwitch={false}
          onChange={(v) => setEmail(v)}
          style={{ marginTop: -20, marginRight: 20 }}
        />

        <Checkbox
          label="Push notification"
          name="notification"
          checked={notification}
          showSwitch={false}
          onChange={(v) => setNotification(v)}
          style={{ marginTop: -20 }}
        />
      </div>

      {response && <p className="color-dark">{response}</p>}

      <div className="text-right mb-3">
        <button
          onClick={sendMessage}
          className="button"
          disabled={!email && !notification}>
          Send
        </button>
      </div>
    </>
  )
}
