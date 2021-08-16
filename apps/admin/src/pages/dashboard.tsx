import Card from '../components/elements/Card'
import Link from 'next/link'
import Dashboard from '../components/layouts/Dashboard'
import VerticalBarChart from '../components/charts/VerticalBarChart'
import IconFriends from '../components/icons/IconFriends'
import IconSteps from '../components/icons/IconSteps'
import IconSleep from '../components/icons/IconSleep'
import IconStairs from '../components/icons/IconStairs'
import IconYoga from '../components/icons/IconYoga'
import ProgressChart from '../components/charts/ProgressChart'
import IconWater from '../components/icons/IconWater'
import Select from '../components/elements/Select'
import IconDownload from '../components/icons/IconDownload'
import { useContext, useState } from 'react'
import {
  startOfYear,
  subYears,
  subMonths,
  startOfMonth,
  startOfWeek,
  subWeeks,
  startOfDay,
  subDays
} from 'date-fns'
import useHealthActivityStats from '../hooks/api/useHealthActivityStats'
import useGoalStats from '../hooks/api/useGoalStats'
import useRewardStats from '../hooks/api/useRewardStats'
import { AuthContext } from '../context/Auth.context'
import useLeagueStats from '../hooks/api/useLeagueStats'

type DateStartEnd = {
  startAt?: Date
  endAt?: Date
}

export default function components() {
  const { focusRole } = useContext(AuthContext)
  const audience = focusRole === 'app' ? 'audience' : focusRole

  const [haTime, setHatTime] = useState<DateStartEnd>({
    startAt: options[2].date,
    endAt: new Date()
  })

  const [goalTime, setGoalTime] = useState<DateStartEnd>({
    startAt: options[2].date,
    endAt: new Date()
  })

  const [rewardTime, setRewardTime] = useState<DateStartEnd>({
    startAt: options[8].date,
    endAt: new Date()
  })

  const [leagueTime, setLeagueTime] = useState<DateStartEnd>({
    startAt: options[8].date,
    endAt: new Date()
  })

  const healthActivitiesData = useHealthActivityStats(focusRole, haTime.startAt)
  const goalStats = useGoalStats(focusRole, goalTime.startAt, goalTime.endAt)
  const rewardStats = useRewardStats(
    focusRole,
    rewardTime.startAt,
    rewardTime.endAt
  )
  const leagueStats = useLeagueStats(
    focusRole,
    leagueTime.startAt,
    leagueTime.endAt
  )

  return (
    <Dashboard title="Dashboard">
      <h1 className="light">
        {focusRole === 'app' && 'Fitlink global statistics'}
        {focusRole === 'organisation' && 'Your organisation at a glance'}
        {focusRole === 'team' && 'Your team at a glance'}
      </h1>
      <div className="row mt-2">
        <div className="col-12 col-lg-6 mt-2">
          <Card className="p-3 card--stretch">
            <div className="row ai-c">
              <div className="col">
                <h2 className="h5 color-light-grey m-0">
                  Most popular activities
                </h2>
              </div>
              <div className="col flex ai-c jc-e">
                <IconDownload
                  width="24px"
                  height="24px"
                  className="mr-1 color-light-grey hover-dark-grey"
                />
                <Select
                  id="activities"
                  defaultValue={options[2]}
                  isSearchable={false}
                  options={options}
                  inline={true}
                  onChange={(v: any) => {
                    setHatTime({
                      startAt: v.date,
                      endAt: v.end_date
                    })
                  }}
                />
              </div>
            </div>
            <div style={{ height: '400px' }}>
              {healthActivitiesData.isFetched && (
                <VerticalBarChart
                  data={{
                    labels: healthActivitiesData.data.results.map(
                      (e) => e.name
                    ),
                    values: healthActivitiesData.data.results.map(
                      (e) => e.count
                    )
                  }}
                />
              )}
            </div>
          </Card>
        </div>
        <div className="col-12 col-lg-6 mt-2">
          {goalStats.isFetched && (
            <Card className="p-3 card--stretch">
              <div className="row ai-c">
                <div className="col">
                  <h2 className="h5 color-light-grey m-0">
                    How is your {audience} doing?
                  </h2>
                </div>
                <div className="col flex ai-c jc-e">
                  <IconDownload
                    width="24px"
                    height="24px"
                    className="mr-1 color-light-grey hover-dark-grey"
                  />
                  <Select
                    id="team"
                    defaultValue={options[2]}
                    isSearchable={false}
                    options={options}
                    inline={true}
                    onChange={(v: any) => {
                      setGoalTime({
                        startAt: v.date,
                        endAt: v.end_date
                      })
                    }}
                  />
                </div>
              </div>
              <div className="row mt-4">
                <div className="col-4 text-center">
                  <ProgressChart
                    progress={goalStats.data.progress_active_users}
                    icon={<IconFriends />}
                    value={goalStats.data.user_active_count.toLocaleString()}
                    goal={goalStats.data.user_total_count.toLocaleString()}
                    label="Active users"
                  />
                </div>
                <div className="col-4 text-center">
                  <ProgressChart
                    progress={goalStats.data.progress_steps}
                    icon={<IconSteps />}
                    value={goalStats.data.current_steps.toLocaleString()}
                    goal={goalStats.data.goal_steps.toLocaleString()}
                    label="Average daily steps"
                    color="#4EF0C2"
                  />
                </div>
                <div className="col-4 text-center">
                  <ProgressChart
                    progress={goalStats.data.progress_sleep_hours}
                    icon={<IconSleep />}
                    value={goalStats.data.current_sleep_hours.toLocaleString()}
                    goal={goalStats.data.goal_sleep_hours.toLocaleString()}
                    label="Average hours slept"
                    color="#7CF5AB"
                  />
                </div>
              </div>
              <div className="row mt-2">
                <div className="col-4 text-center">
                  <ProgressChart
                    progress={goalStats.data.progress_mindfulness_minutes}
                    icon={<IconYoga />}
                    value={goalStats.data.current_mindfulness_minutes.toLocaleString()}
                    goal={goalStats.data.goal_mindfulness_minutes.toLocaleString()}
                    label="Average mindful minutes"
                    color="#A6F893"
                  />
                </div>
                <div className="col-4 text-center">
                  <ProgressChart
                    progress={goalStats.data.progress_floors_climbed}
                    icon={<IconStairs />}
                    value={goalStats.data.current_floors_climbed.toLocaleString()}
                    goal={goalStats.data.goal_floors_climbed.toLocaleString()}
                    label="Average floors climbed"
                    color="#7CF5AB"
                  />
                </div>
                <div className="col-4 text-center">
                  <ProgressChart
                    progress={goalStats.data.progress_water_litres}
                    icon={<IconWater />}
                    value={goalStats.data.current_water_litres.toLocaleString()}
                    goal={goalStats.data.goal_water_litres.toLocaleString()}
                    label="Average water intake"
                    color="#4EF0C2"
                  />
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
      <div className="row mt-2">
        <div className="col-12 col-xl-6 col-hd-4 mt-2">
          <Card className="p-3 card--stretch">
            <div className="row ai-c">
              <div className="col">
                <h2 className="h5 color-light-grey m-0">Popular leagues</h2>
              </div>
              <div className="col flex ai-c jc-e">
                <IconDownload
                  width="24px"
                  height="24px"
                  className="mr-1 color-light-grey hover-dark-grey"
                />
                <Select
                  id="leagues"
                  defaultValue={options[8]}
                  isSearchable={false}
                  options={options.slice(2, 8)}
                  inline={true}
                  onChange={(v: any) => {
                    setLeagueTime({
                      startAt: v.date,
                      endAt: v.end_date
                    })
                  }}
                />
              </div>
            </div>
            <table className="static-table mt-2">
              <tbody>
                {leagueStats.isFetched &&
                  leagueStats.data.slice(0, 6).map((e, i) => (
                    <tr key={`row${i}`}>
                      <td>
                        <div
                          className="static-table__image"
                          style={{ backgroundImage: `url(${e.image_url})` }}
                        />
                      </td>
                      <td>
                        <strong className="medium">{e.sport}</strong>
                      </td>
                      <td>{e.name}</td>
                      <td className="text-right">
                        <div
                          className="chip"
                          style={{ backgroundColor: colors[i] }}>
                          {e.participants_total}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </Card>
        </div>
        <div className="col-12 col-xl-6 col-hd-4 mt-2">
          <Card className="p-3 card--stretch">
            <div className="row ai-c">
              <div className="col">
                <h2 className="h5 color-light-grey m-0">Popular rewards</h2>
              </div>
              <div className="col flex ai-c jc-e">
                <IconDownload
                  width="24px"
                  height="24px"
                  className="mr-1 color-light-grey hover-dark-grey"
                />
                <Select
                  id="rewards"
                  defaultValue={options[8]}
                  isSearchable={false}
                  options={options.slice(2, 8)}
                  inline={true}
                  onChange={(v: any) => {
                    setRewardTime({
                      startAt: v.date,
                      endAt: v.end_date
                    })
                  }}
                />
              </div>
            </div>
            <table className="static-table mt-2">
              <tbody>
                {rewardStats.isFetched &&
                  rewardStats.data &&
                  rewardStats.data.slice(0, 6).map((e, i) => (
                    <tr key={`row${i}`}>
                      <td>
                        <div
                          className="static-table__image"
                          style={{ backgroundImage: `url(${e.image_url})` }}
                        />
                      </td>
                      <td>
                        <strong className="medium">{e.brand}</strong>
                      </td>
                      <td>{e.name}</td>
                      <td className="text-right">
                        <div
                          className="chip"
                          style={{ backgroundColor: colors[i] }}>
                          {e.redeem_count}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </Card>
        </div>
      </div>
      <div className="row mt-2">
        <div className="col-12 col-lg-6 mt-2">
          <Card className="p-3 card--stretch">
            <h2 className="h5 color-light-grey mt-1">Team insights</h2>
            <ul className="news">
              <li className="unread">
                <h5>Your team isn't dinking enough water 💧</h5>
                <p>
                  Failing to drink enough water can cause dehydration and
                  adverse symptoms, including fatigue, headache and weakened
                  immunity. Here are some tips to promote water intake.
                </p>
              </li>
              <Link href="/demo/knowledge-base/3316">
                <li className="unread link">
                  <h5>Encouranging mindfulness in the workplace 🧘🏽</h5>
                  <p>
                    One way mindfulness can help is simply by allowing us to
                    improve our focus. When we constantly flit from one task to
                    another, the quality of our work can suffer. By practicing
                    mindfulness — simply coming back to the present moment over
                    and over again — we can train ourselves to become more
                    focused.
                  </p>
                </li>
              </Link>
              <li>
                <h5>Create your first league 🏆</h5>
                <p>
                  Inspire your team to get moving, why not create a simple steps
                  league so that everyone can get involved.
                </p>
              </li>
              <li>
                <h5>Create your first reward 🎁</h5>
                <p>
                  Encourage your team to get active, get moving and stay healthy
                  by creating rewards that fit your people. How about free yoga
                  classes, a free smoothie, fitness trackers and gadgets, spa
                  vouchers, lunch vouchers, 1-hour off work, a day off work, a
                  free getaway? The options are endless.
                </p>
              </li>
            </ul>
          </Card>
        </div>
        <div className="col-12 col-lg-6 mt-2">
          <Card className="p-3 card--stretch">
            <h2 className="h5 color-light-grey mt-1">Fitlink News</h2>
            <ul className="news">
              <li className="unread">
                <h5>App version 2.1.0 release</h5>
                <p>
                  We've made a few under the hood improvements to performace.
                  This update will happen automatically when your team launches
                  the app.
                </p>
              </li>
              <li className="unread">
                <img src="/temp/ecologi.svg" alt="" />
                <h5>Give back with Ecologi 🌱</h5>
                <p>
                  We've partnered with Ecologi to offer all Fitlink teams the
                  opportunity to reward their users with carbon offsetting and
                  planting trees. Spend your points on making the world a better
                  place.
                </p>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </Dashboard>
  )
}

const options = [
  {
    label: 'Today',
    value: 'today',
    date: startOfDay(new Date()),
    end_date: new Date()
  },
  {
    label: 'Yesterday',
    value: 'yesterday',
    date: subDays(startOfDay(new Date()), 1),
    end_date: startOfDay(new Date())
  },
  {
    label: 'This week',
    value: 'thisweek',
    date: startOfWeek(new Date())
  },
  {
    label: 'Last week',
    value: 'lastweek',
    date: subWeeks(startOfWeek(new Date()), 1),
    end_date: startOfWeek(new Date())
  },
  {
    label: 'This month',
    value: 'thismonth',
    date: startOfMonth(new Date())
  },
  {
    label: 'Last month',
    value: 'lastmonth',
    date: subMonths(startOfMonth(new Date()), 1),
    end_date: startOfMonth(new Date())
  },
  {
    label: 'This year',
    value: 'thisyear',
    date: startOfYear(new Date())
  },
  {
    label: 'Last year',
    value: 'lastyear',
    date: subDays(startOfYear(new Date()), 365),
    end_date: startOfYear(new Date())
  },
  {
    label: 'All time',
    value: 'all',
    date: subYears(new Date(), 10)
  }
]

const colors = [
  '#864A76',
  '#7E69A8',
  '#5A8BD1',
  '#00AEE8',
  '#00CDE9',
  '#00E9D7',
  '#4EF0C2',
  '#7CF5AB',
  '#A6F893',
  '#D0FA7F'
]
