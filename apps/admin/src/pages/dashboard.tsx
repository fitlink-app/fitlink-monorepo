import Card from '../components/elements/Card'
import Dashboard from '../components/layouts/Dashboard'
import VerticalBarChart from '../components/charts/VerticalBarChart'

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
            <div style={{height: '300px'}}>
              <VerticalBarChart />
            </div>
          </Card>
        </div>
        <div className="col-12 col-lg-6 mt-2">
          <Card className="p-3 card--stretch">
            <h2 className="h5 color-light-grey">How is your team doing?</h2>
          </Card>
        </div>
      </div>
    </Dashboard>
  )
}