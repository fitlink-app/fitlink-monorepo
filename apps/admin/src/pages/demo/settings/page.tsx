import Card from '../../../components/elements/Card'
import Dashboard from '../../../components/layouts/Dashboard'

export default function page() {
  return (
    <Dashboard title="Settings Page" linkPrefix="/demo">
      <h1 className="light">Manage my page</h1>
      <div className="row mt-2">
        <div className="col-12 col-lg-6 mt-2">
          <Card className="p-3 card--stretch pb-4">
            {/* <h2 className="h5 color-light-grey m-0">General account settings</h2> */}
          </Card>
        </div>
        <div className="col-12 col-lg-6 mt-2"></div>
      </div>
    </Dashboard>
  )
}
