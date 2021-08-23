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
import Feedback from '../components/elements/Feedback'
import IconDownload from '../components/icons/IconDownload'
import { useContext, useState } from 'react'
import useHealthActivityStats from '../hooks/api/useHealthActivityStats'
import useGoalStats from '../hooks/api/useGoalStats'
import useRewardStats from '../hooks/api/useRewardStats'
import { AuthContext } from '../context/Auth.context'
import useLeagueStats from '../hooks/api/useLeagueStats'
import useGlobalStats from '../hooks/api/useGlobalStats'
import capitalize from 'lodash/capitalize'
import { options } from '../data/date-options'

type DateStartEnd = {
  startAt?: Date
  endAt?: Date
}

export default function components() {
  const { focusRole } = useContext(AuthContext)

  return (
    <Dashboard title="Dashboard">
      <h1 className="light">
        {focusRole === 'app' && 'Fitlink global statistics'}
        {focusRole === 'organisation' && 'Your organisation at a glance'}
        {focusRole === 'team' && 'Your team at a glance'}
      </h1>
      <div className="row mt-2">
        <div className="col-12 col-lg-6 mt-2">
          <PopularActivities />
        </div>
        <div className="col-12 col-lg-6 mt-2">
          <GoalStats />
        </div>
      </div>
      <div className="row mt-2">
        <div className="col-12 col-xl-6 col-hd-4 mt-2">
          <PopularLeagues />
        </div>
        <div
          className="col-12 col-xl-6 col-hd-4 mt-2"
          style={{ minHeight: 400 }}>
          <PopularRewards />
        </div>
      </div>
      {focusRole !== 'app' && (
        <div className="row mt-2">
          <div className="col-12 col-lg-6 mt-2">
            <GlobalInsights />
          </div>
          <div className="col-12 col-lg-6 mt-2">
            <FitlinkNews />
          </div>
        </div>
      )}
    </Dashboard>
  )
}

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

function PopularActivities() {
  const [dates, setDates] = useState({
    startAt: options[2].date,
    endAt: new Date()
  })

  const { focusRole } = useContext(AuthContext)

  const query = useHealthActivityStats(focusRole, dates.startAt, dates.endAt)

  return (
    <Card className="p-3 card--stretch">
      <div className="row ai-c">
        <div className="col">
          <h2 className="h5 color-light-grey m-0">Most popular activities</h2>
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
              setDates({
                startAt: v.date,
                endAt: v.end_date
              })
            }}
          />
        </div>
      </div>
      <div style={{ height: '400px' }}>
        {query.isFetched && query.data.results.length > 0 && (
          <VerticalBarChart
            data={{
              labels: query.data.results.map((e) => e.name),
              values: query.data.results.map((e) => e.count)
            }}
          />
        )}
        {query.isFetched && query.data.results.length === 0 && <NoData />}
      </div>
    </Card>
  )
}

function GoalStats() {
  const [dates, setDates] = useState({
    startAt: options[2].date,
    endAt: new Date()
  })

  const { focusRole } = useContext(AuthContext)
  const audience = focusRole === 'app' ? 'audience' : focusRole
  const query = useGoalStats(focusRole, dates.startAt, dates.endAt)

  return (
    query.isFetched && (
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
                setDates({
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
              progress={query.data.progress_active_users}
              icon={<IconFriends />}
              value={query.data.user_active_count.toLocaleString()}
              goal={query.data.user_total_count.toLocaleString()}
              label="Active users"
            />
          </div>
          <div className="col-4 text-center">
            <ProgressChart
              progress={query.data.progress_steps}
              icon={<IconSteps />}
              value={query.data.current_steps.toLocaleString()}
              goal={query.data.goal_steps.toLocaleString()}
              label="Average daily steps"
              color="#4EF0C2"
            />
          </div>
          <div className="col-4 text-center">
            <ProgressChart
              progress={query.data.progress_sleep_hours}
              icon={<IconSleep />}
              value={query.data.current_sleep_hours.toLocaleString()}
              goal={query.data.goal_sleep_hours.toLocaleString()}
              label="Average hours slept"
              color="#7CF5AB"
            />
          </div>
        </div>
        <div className="row mt-2">
          <div className="col-4 text-center">
            <ProgressChart
              progress={query.data.progress_mindfulness_minutes}
              icon={<IconYoga />}
              value={query.data.current_mindfulness_minutes.toLocaleString()}
              goal={query.data.goal_mindfulness_minutes.toLocaleString()}
              label="Average mindful minutes"
              color="#A6F893"
            />
          </div>
          <div className="col-4 text-center">
            <ProgressChart
              progress={query.data.progress_floors_climbed}
              icon={<IconStairs />}
              value={query.data.current_floors_climbed.toLocaleString()}
              goal={query.data.goal_floors_climbed.toLocaleString()}
              label="Average floors climbed"
              color="#7CF5AB"
            />
          </div>
          <div className="col-4 text-center">
            <ProgressChart
              progress={query.data.progress_water_litres}
              icon={<IconWater />}
              value={query.data.current_water_litres.toLocaleString()}
              goal={query.data.goal_water_litres.toLocaleString()}
              label="Average water intake"
              color="#4EF0C2"
            />
          </div>
        </div>
      </Card>
    )
  )
}

function PopularLeagues() {
  const { focusRole } = useContext(AuthContext)

  const [dates, setDates] = useState<DateStartEnd>({
    startAt: options[2].date,
    endAt: new Date()
  })

  const query = useLeagueStats(focusRole, dates.startAt, dates.endAt)

  return (
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
              setDates({
                startAt: v.date,
                endAt: v.end_date
              })
            }}
          />
        </div>
      </div>
      {query.isFetched && (
        <table className="static-table mt-2">
          <tbody>
            {query.data.slice(0, 6).map((e, i) => (
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
                  <div className="chip" style={{ backgroundColor: colors[i] }}>
                    {e.participants_total}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {query.isFetched && query.data.length === 0 && <NoData />}
    </Card>
  )
}

function PopularRewards() {
  const [dates, setDates] = useState<DateStartEnd>({
    startAt: options[8].date,
    endAt: new Date()
  })

  const { focusRole } = useContext(AuthContext)

  const query = useRewardStats(focusRole, dates.startAt, dates.endAt)

  return (
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
              setDates({
                startAt: v.date,
                endAt: v.end_date
              })
            }}
          />
        </div>
      </div>
      {query.isFetched && (
        <table className="static-table mt-2">
          <tbody>
            {query.data.slice(0, 6).map((e, i) => (
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
                  <div className="chip" style={{ backgroundColor: colors[i] }}>
                    {e.redeem_count}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {query.isFetched && query.data.length === 0 && <NoData />}
    </Card>
  )
}

function GlobalInsights() {
  const { focusRole } = useContext(AuthContext)
  const query = useGlobalStats(focusRole)

  return (
    <Card className="p-3 card--stretch">
      <h2 className="h5 color-light-grey mt-1">
        {capitalize(focusRole)} insights
      </h2>
      <ul className="news">
        <li className="unread">
          <h5>Your {focusRole} isn't drinking enough water 💧</h5>
          <p>
            Failing to drink enough water can cause dehydration and adverse
            symptoms, including fatigue, headache and weakened immunity. Here
            are some tips to promote water intake.
          </p>
        </li>
        <Link href="/knowledge-base/3316">
          <li className="unread link">
            <h5>Encouraging mindfulness in the workplace 🧘🏽</h5>
            <p>
              One way mindfulness can help is simply by allowing us to improve
              our focus. When we constantly flit from one task to another, the
              quality of our work can suffer. By practicing mindfulness — simply
              coming back to the present moment over and over again — we can
              train ourselves to become more focused.
            </p>
          </li>
        </Link>
        {query.isFetched && query.data.league_count === 0 && (
          <li>
            <h5>Create your first {focusRole} league 🏆</h5>
            {focusRole === 'organisation' && (
              <p>
                Create an organisation league if you want anyone across your
                company to be able to participate, regardless of their team.
              </p>
            )}
            <p>
              Inspire your {focusRole} to get moving, why not create a simple
              steps league so that everyone can get involved.
            </p>
          </li>
        )}

        {query.isFetched && query.data.league_count > 0 && (
          <li>
            <h5>
              You have {query.data.league_count} league
              {query.data.league_count > 1 ? 's' : ''} 🏆
            </h5>
            <p>
              Well done! Leagues create healthy competition and inspire your
              team to keep moving.
            </p>
          </li>
        )}

        {query.isFetched && query.data.reward_count === 0 && (
          <li>
            <h5>Create your first {focusRole} reward 🎁</h5>
            {focusRole === 'organisation' && (
              <p>
                Create an organisation reward if you want anyone across your
                company to be able to be rewarded with it, regardless of their
                team.
              </p>
            )}
            <p>
              Encourage your {focusRole} to get active, get moving and stay
              healthy by creating rewards that fit your people. How about free
              yoga classes, a free smoothie, fitness trackers and gadgets, spa
              vouchers, lunch vouchers, 1-hour off work, a day off work, a free
              getaway? The options are endless.
            </p>
          </li>
        )}

        {query.isFetched && query.data.reward_count > 0 && (
          <li>
            <h5>
              You have {query.data.reward_count} reward
              {query.data.reward_count > 1 ? 's' : ''} 🎁
            </h5>
            <p>
              Great job! Rewards motivate and encourage your team to stay
              active.
            </p>
          </li>
        )}
      </ul>
    </Card>
  )
}

function FitlinkNews() {
  return (
    <Card className="p-3 card--stretch">
      <h2 className="h5 color-light-grey mt-1">Fitlink News</h2>
      <ul className="news">
        <li className="unread">
          <h5>App version 2.1.0 release</h5>
          <p>
            We've made a few under the hood improvements to performace. This
            update will happen automatically when your team launches the app.
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
  )
}

function NoData() {
  return (
    <Feedback
      type="default"
      message="No data available for this period."
      className="mt-2"
    />
  )
}
