import Dashboard from '../components/layouts/Dashboard'
import TableContainer from '../components/table/TableContainer'
import { toDateCell } from '../components/table/helpers'
import { api } from '../context/Auth.context'

export default function components() {

  return (
    <Dashboard
      title="Users"
      >
      <h1 className="light">User performance</h1>
      <p>To comply with GDPA regulations, user information is annonymous.</p>
      <div className="mt-4">
      {/* <TableContainer
        columns={[
          { Header: 'User', accessor: 'user' },
          { Header: 'Mobile OS', accessor: 'mobile_os' },
          { Header: 'Tracker', accessor: 'tracker' },
          { Header: 'Total Points', accessor: 'points' },
          { Header: 'Date Joined', accessor: 'date_joined', Cell: toDateCell },
          { Header: 'Last app session', accessor: 'last_session', Cell: toDateCell },
          { Header: 'Last activity', accessor: 'last_activity' },
          { Header: 'Total Users', accessor: 'user_count' },
          { Header: 'Total leagues', accessor: 'total_leagues' },
          { Header: 'Leagues created', accessor: 'created_leagues' },
          { Header: 'Reward redeemed', accessor: 'rewards' },
          { Header: 'Activities created', accessor: 'created_activities' },
        ]}
        fetch={dummy}
        /> */}
      </div>
    </Dashboard>
  )
}
/*
OS or Android
Version they have installed
Trackers they have connected
Total points
Date joined
Last app session
Last activity tracked
How many leagues they are in
How many leagues they created
How many rewards they redeemed
What rewards they redeemed
How many activities they created
*/