import { useState } from 'react'
import { format } from 'date-fns'
import Input from '../elements/Input'

export type UserStatsProps = {
  date_joined: string
  mobile_os: string
  tracker: string
  points: number
  rank: string
  last_activity: string
  total_leagues: number
  rewards: number
  last_session: string
  created_leagues: string
}

export default function UserStats({
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
}: UserStatsProps) {
  const [userMsg, setUserMsg] = useState('')
  const [response, setResponse] = useState('')

  const sendMessage = () => {
    console.log(userMsg)
    // send message
    setResponse('Your message has been sent')
    setUserMsg('')
  }

  return (
    <>
      <h4 className="light mb-3">User details</h4>
      <Input
        label="Send this user a message"
        name="message"
        value={userMsg}
        type="textarea"
        onChange={(e) => {
          setUserMsg(e)
          setResponse('')
        }}
        placeholder="Send this user a push notification of praise or encourangement"
      />
      {response && <p className="color-dark">{response}</p>}
      <div className="text-right mb-3">
        <button onClick={sendMessage} className="button">
          Send
        </button>
      </div>
      <h6>Date joined</h6>
      <p>{format(new Date(date_joined), 'yyyy-MM-dd H:m:s OOOO')}</p>
      <hr className="tight" />
      <h6>Mobile operating system</h6>
      <p>{mobile_os}</p>
      <hr className="tight" />
      <h6>Connected trackers</h6>
      <p>{tracker}</p>
      <hr className="tight" />
      <h6>Last app session</h6>
      <p>{format(new Date(last_session), 'yyyy-MM-dd H:m:s OOOO')}</p>
      <hr className="tight" />
      <h6>Total points</h6>
      <p>{points.toLocaleString()}</p>
      <hr className="tight" />
      <h6>Rank</h6>
      <p>{rank}</p>
      <hr className="tight" />
      <h6>Last activity tracked</h6>
      <p>{last_activity}</p>
      <hr className="tight" />
      <h6>Leagues joined</h6>
      <p>{total_leagues.toLocaleString()}</p>
      <hr className="tight" />
      <h6>Leagues created</h6>
      <p>{created_leagues.toLocaleString()}</p>
      <hr className="tight" />
      <h6>Rewards redeemed</h6>
      <p>{rewards.toLocaleString()}</p>
    </>
  )
}
