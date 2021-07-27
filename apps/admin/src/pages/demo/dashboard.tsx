import Link from 'next/link'
import toast from 'react-hot-toast'
import Card from '../../components/elements/Card'
import Dashboard from '../../components/layouts/Dashboard'
import VerticalBarChart from '../../components/charts/VerticalBarChart'
import IconFriends from '../../components/icons/IconFriends'
import IconSteps from '../../components/icons/IconSteps'
import IconSleep from '../../components/icons/IconSleep'
import IconStairs from '../../components/icons/IconStairs'
import IconYoga from '../../components/icons/IconYoga'
import ProgressChart from '../../components/charts/ProgressChart'
import IconWater from '../../components/icons/IconWater'
import Select from '../../components/elements/Select'
import IconDownload from '../../components/icons/IconDownload'
// eslint-disable-next-line @typescript-eslint/no-var-requires
let rewards = require('../../services/dummy/stats-rewards.json')

export default function page() {
  rewards = rewards.sort(
    (a, b) => parseFloat(b['redeemed']) - parseFloat(a['redeemed'])
  )

  const options = [
    {
      label: 'Today',
      value: 'today'
    },
    {
      label: 'Yesterday',
      value: 'yesterday'
    },
    {
      label: 'This week',
      value: 'thisweek'
    },
    {
      label: 'Last week',
      value: 'lastweek'
    },
    {
      label: 'This month',
      value: 'thismonth'
    },
    {
      label: 'Last month',
      value: 'lastmonth'
    },
    {
      label: 'This year',
      value: 'thisyear'
    },
    {
      label: 'All time',
      value: 'all'
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

  const prepareDownload = () => {
    return new Promise(function(resolve, reject) {
      setTimeout(resolve, 2000);
    }).then(function() {
      console.log('success');
    })
  }

  return (
    <Dashboard title="Dashboard">
      <h1 className="light">Your team at a glance</h1>
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
                  onClick={
                    () => toast.promise(
                      prepareDownload(), {
                         loading: 'Preparing download...',
                         success: <b>Download starting</b>,
                         error: <b>Download failed</b>,
                       }
                     )
                  }
                />
                <Select
                  id="activities"
                  defaultValue={options[0]}
                  isSearchable={false}
                  options={options}
                  inline={true}
                  onChange={(v) => console.log(v.value)}
                />
              </div>
            </div>
            <div style={{ height: '400px' }}>
              <VerticalBarChart />
            </div>
          </Card>
        </div>
        <div className="col-12 col-lg-6 mt-2">
          <Card className="p-3 card--stretch">
            <div className="row ai-c">
              <div className="col">
                <h2 className="h5 color-light-grey m-0">
                  How is your team doing?
                </h2>
              </div>
              <div className="col flex ai-c jc-e">
                <IconDownload
                  width="24px"
                  height="24px"
                  className="mr-1 color-light-grey hover-dark-grey"
                  onClick={
                    () => toast.promise(
                      prepareDownload(), {
                         loading: 'Preparing download...',
                         success: <b>Download starting</b>,
                         error: <b>Download failed</b>,
                       }
                     )
                  }
                />
                <Select
                  id="team"
                  defaultValue={options[0]}
                  isSearchable={false}
                  options={options}
                  inline={true}
                  onChange={(v) => console.log(v.value)}
                />
              </div>
            </div>
            <div className="row mt-4">
              <div className="col-4 text-center">
                <ProgressChart
                  progress={85}
                  icon={<IconFriends />}
                  value="22"
                  goal="26"
                  label="Active users"
                />
              </div>
              <div className="col-4 text-center">
                <ProgressChart
                  progress={81}
                  icon={<IconSteps />}
                  value="8,134"
                  goal="10,000"
                  label="Average daily steps"
                  color="#4EF0C2"
                />
              </div>
              <div className="col-4 text-center">
                <ProgressChart
                  progress={75}
                  icon={<IconSleep />}
                  value="6"
                  goal="8"
                  label="Average hours slept"
                  color="#7CF5AB"
                />
              </div>
            </div>
            <div className="row mt-2">
              <div className="col-4 text-center">
                <ProgressChart
                  progress={33}
                  icon={<IconYoga />}
                  value="3"
                  goal="10"
                  label="Average mindful minutes"
                  color="#A6F893"
                />
              </div>
              <div className="col-4 text-center">
                <ProgressChart
                  progress={100}
                  icon={<IconStairs />}
                  value="14"
                  goal="11"
                  label="Average floors climbed"
                  color="#7CF5AB"
                />
              </div>
              <div className="col-4 text-center">
                <ProgressChart
                  progress={50}
                  icon={<IconWater />}
                  value="1"
                  goal="2L"
                  label="Average water intake"
                  color="#4EF0C2"
                />
              </div>
            </div>
          </Card>
        </div>
      </div>
      <div className="row mt-2">
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
                  onClick={
                    () => toast.promise(
                      prepareDownload(), {
                         loading: 'Preparing download...',
                         success: <b>Download starting</b>,
                         error: <b>Download failed</b>,
                       }
                     )
                  }
                />
                <Select
                  id="activities"
                  defaultValue={options[7]}
                  isSearchable={false}
                  options={options.slice(2, 8)}
                  inline={true}
                  onChange={(v) => console.log(v.value)}
                />
              </div>
            </div>
            <table className="static-table mt-2">
              <tbody>
                {rewards.slice(0, 10).map((e, i) => (
                  <tr key={`row${i}`}>
                    <td>
                      <div
                        className="static-table__image"
                        style={{ backgroundImage: `url(${e.image})` }}
                      />
                    </td>
                    <td>
                      <strong className="medium">{e.brand}</strong>
                    </td>
                    <td>{e.title}</td>
                    <td className="text-right">
                      <div
                        className="chip"
                        style={{ backgroundColor: colors[i] }}>
                        {e.redeemed}
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
        <div className="col-12 col-hd-4 mt-2">
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
                  We've partnered with Ecologi to offer all Fitlink teams the opportunity to reward their users with carbon offsetting and planting trees. Spend your points on making the world a better place.
                </p>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </Dashboard>
  )
}
