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
// eslint-disable-next-line @typescript-eslint/no-var-requires
let rewards = require('../../services/dummy/stats-rewards.json')

export default function components() {
  rewards = rewards.sort((a, b) => parseFloat(b['redeemed']) - parseFloat(a['redeemed']))

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
      label: 'All data',
      value: 'all'
    }
  ]

  const colors = [
    '#00E9D7',
    '#00CDE9',
    '#00AEE8',
    '#5A8BD1',
    '#7E69A8',
    '#864A76',
    '#4EF0C2',
    '#7CF5AB',
    '#A6F893',
    '#D0FA7F'
  ]

  return (
    <Dashboard title="Dashboard">
      <h1 className="light">Your team at a glance</h1>
      <div className="row mt-2">
        <div className="col-12 col-lg-6 mt-2">
          <Card className="p-3 card--stretch">
            <div className="row ai-c">
              <div className="col">
                <h2 className="h5 color-light-grey m-0">Most popular activities</h2>
              </div>
              <div className="col text-right">
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
                <h2 className="h5 color-light-grey m-0">How is your team doing?</h2>
              </div>
              <div className="col text-right">
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
        <div className="col-12 col-lg-6 mt-2">
          <Card className="p-3 card--stretch">
            <div className="row ai-c">
              <div className="col">
                <h2 className="h5 color-light-grey m-0">Popular rewards</h2>
              </div>
              <div className="col text-right">
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
                { rewards.slice(0, 10).map((e, i) => (
                  <tr key={`row${i}`}>
                    <td>
                      <div className="static-table__image" style={{backgroundImage: `url(${e.image})`}} />
                    </td>
                    <td>
                    <strong className="medium">{e.brand}</strong>
                    </td>
                    <td>{e.title}</td>
                    <td className="text-right">
                      <div className="chip" style={{backgroundColor: colors[i]}}>
                        {e.redeemed}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
        <div className="col-12 col-lg-6 mt-2">
          <Card className="p-3 card--stretch">
            <h2 className="h5 color-light-grey mt-1">News and recommendations</h2>
          </Card>
        </div>
      </div>
    </Dashboard>
  )
}
