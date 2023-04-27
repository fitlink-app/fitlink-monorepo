import { useState, useEffect, useMemo } from 'react'
import Event from '../../components/elements/Event'
import Select from '../../components/elements/Select'
import SortOrder from '../../components/elements/SortOrder'
import Dashboard from '../../components/layouts/Dashboard'
import Drawer from '../../components/elements/Drawer'
import EventForm from '../../components/forms/EventForm'
import { AnimatePresence } from 'framer-motion'
import IconPlus from '../../components/icons/IconPlus'
import Input from '../../components/elements/Input'
import Checkbox from '../../components/elements/Checkbox'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const events = require('../../services/dummy/events.json')
const teamUsers = require('../../services/dummy/team-users.json')

export default function page() {
  const [drawContent, setDrawContent] = useState<
    React.ReactNode | undefined | false
  >(false)
  const [warning, setWarning] = useState(false)
  const [sorted, setSorted] = useState([])
  const [sort, setSort] = useState<'asc' | 'desc'>('desc')
  const [sortOn, setSortOn] = useState('members')

  const options = [
    {
      label: 'Members',
      value: 'members'
    },
    {
      label: 'Title',
      value: 'title'
    },
    {
      label: 'Date',
      value: 'startDate'
    }
  ]

  useEffect(() => {
    const orig = JSON.parse(JSON.stringify(events))
    switch (sortOn) {
      case 'members':
        setSorted(
          orig.results.sort((a, b) =>
            sort === 'asc'
              ? parseFloat(a[sortOn]) - parseFloat(b[sortOn])
              : parseFloat(b[sortOn]) - parseFloat(a[sortOn])
          )
        )
        break
      default:
        setSorted(
          sort === 'asc'
            ? orig.results.sort((a, b) => a[sortOn].localeCompare(b[sortOn]))
            : orig.results
                .sort((a, b) => a[sortOn].localeCompare(b[sortOn]))
                .reverse()
        )
    }
  }, [events, sortOn, sort])

  const loadEvent = (event: any) => {
    setWarning(true)
    setDrawContent(<EventForm current={event} />)
  }

  const NewEventForm = () => {
    setWarning(true)
    setDrawContent(<EventForm />)
  }

  return (
    <Dashboard title="Events">
      <div className="row ai-c mb-2">
        <div className="col-12 col-lg-8">
          <div className="flex ai-c">
            <h1 className="light mb-0 mr-2">Your events</h1>
            <button className="button alt small mt-1" onClick={NewEventForm}>
              Add new
            </button>
          </div>
        </div>
        <div className="col-12 col-lg-4 text-lg-right">
          <Select
            id="sort"
            defaultValue={options[0]}
            isSearchable={false}
            options={options}
            label="Sort by"
            inline={true}
            onChange={(v) => setSortOn(v.value)}
          />
          <SortOrder value={sort} onChange={(e) => setSort(e)} />
        </div>
      </div>
      <div className="rewards flex mb-4">
        <div className="p-1">
          <div
            className="rewards__add"
            onClick={NewEventForm}
            style={{ height: 200 }}>
            <IconPlus />
          </div>
        </div>

        {sorted.map((r: any, i) => (
          <div className="rewards__wrap" key={`fl-r-${i}`}>
            <Event
              {...r}
              onClick={() => loadEvent(r)}
              onViewAttendeesClick={(event) => {
                event.stopPropagation()
                setWarning(true)
                setDrawContent(<AttendeesList attendees={r?.members || 0} />)
              }}
            />
          </div>
        ))}
      </div>
      <AnimatePresence initial={false}>
        {drawContent && (
          <Drawer
            remove={() => setDrawContent(null)}
            key="drawer"
            warnBeforeClose={warning}>
            {drawContent}
          </Drawer>
        )}
      </AnimatePresence>
    </Dashboard>
  )
}

const getAttendeesList = (amount: any) => {
  const users = []
  let index = 0

  while (users.length < amount) {
    if (index >= teamUsers.results.length - 1) {
      index = 0
    }

    users.push(teamUsers.results[index])

    index++
  }

  return users.sort(() => 0.5 - Math.random())
}

export const AttendeesList = ({ attendees = 1 }: { attendees: any }) => {
  const users = useMemo(
    () => getAttendeesList(parseInt(attendees)),
    [attendees]
  )

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
        label="Send the attendees a message"
        name="message"
        value={userMsg}
        type="textarea"
        onChange={(e) => {
          setUserMsg(e)
          setResponse('')
        }}
        placeholder="Send the attendees a message of praise or encouragement"
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

      <br />

      <h4 className="light mb-3">Attendees</h4>

      {users.map((user, index) => (
        <div className="avatar-select" key={index}>
          <div
            className="avatar-select__preview"
            style={{ backgroundImage: `url(${user.avatar})` }}
          />
          <label>
            {user.firstName} {user.lastName}
          </label>
        </div>
      ))}
    </>
  )
}
