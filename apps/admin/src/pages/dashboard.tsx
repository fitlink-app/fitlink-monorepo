import Card from '../components/elements/Card'
import Dashboard from '../components/layouts/Dashboard'
import VerticalBarChart from '../components/charts/VerticalBarChart'
import IconFriends from '../components/icons/IconFriends'
import IconSteps from '../components/icons/IconSteps'
import IconSleep from '../components/icons/IconSleep'
import IconStairs from '../components/icons/IconStairs'
import IconRun from '../components/icons/IconRun'
import IconBike from '../components/icons/IconBike'
import IconYoga from '../components/icons/IconYoga'
import IconRewards from '../components/icons/IconRewards'
import CircleProgess from '../components/charts/CircleProgress'
import ProgressChart from '../components/charts/ProgressChart'

export default function components() {

  return (
    <Dashboard
      title="Dashboard"
      >
      <h1 className="light">Your team at a glance</h1>
      <div className="row mt-2">
        <div className="col-12 col-lg-6 mt-2">
          <Card className="p-3 card--stretch">
            <h2 className="h5 color-light-grey">Most popular activities</h2>
            <div style={{height: '400px'}}>
              <VerticalBarChart />
            </div>
          </Card>
        </div>
        <div className="col-12 col-lg-6 mt-2">
          <Card className="p-3 card--stretch">
            <h2 className="h5 color-light-grey">How is your team doing?</h2>
            <div className="row mt-4">
              <div className="col-3 text-center">
                <ProgressChart
                  progress={ 85 }
                  icon={ <IconFriends /> }
                  value="22/26"
                  label="Active users"
                />
              </div>
              <div className="col-3 text-center">
                <ProgressChart
                  progress={ 81 }
                  icon={ <IconSteps /> }
                  value="8134"
                  label="Average daily steps"
                />
              </div>
              <div className="col-3 text-center">
                <ProgressChart
                  progress={ 75 }
                  icon={ <IconSleep /> }
                  value="6"
                  label="Average hours slept"
                />
              </div>
              <div className="col-3 text-center">
                <ProgressChart
                  progress={ 33 }
                  icon={ <IconYoga /> }
                  value="3"
                  label="Average mindful minutes"
                />
              </div>
            </div>
            <div className="row mt-2">
              <div className="col-3 text-center">
                <ProgressChart
                  progress={ 100 }
                  icon={ <IconStairs /> }
                  value="14"
                  label="Average floors climbed"
                />
              </div>
              <div className="col-3 text-center">
                <IconRun width="32px" height="32px" />
                <h3 className="p">Distance Run</h3>
              </div>
              <div className="col-3 text-center">
                <IconBike width="32px" height="32px" />
                <h3 className="p">Distance Cycled</h3>
              </div>
              <div className="col-3 text-center">
                <IconRewards width="32px" height="32px" />
                <h3 className="p">Rewards Claimed</h3>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Dashboard>
  )
}