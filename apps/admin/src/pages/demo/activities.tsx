import Dashboard from '../../components/layouts/Dashboard'
import TableContainer from '../../components/table/TableContainer'
import {
  toChipCell
} from '../../components/table/helpers'
import IconSearch from '../../components/icons/IconSearch'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const dummy = require('../../services/dummy/activities.json')

export default function components() {

  const displayImage = ({ value }) => {
    return (
      <div className="map-preview">
        <img src={`https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/${value.coordinates[1]},${value.coordinates[0]},15,0,0/400x200?access_token=pk.eyJ1IjoibHVrZS1maXRsaW5rYXBwIiwiYSI6ImNrbzBhNWtweTBkcW8yd29idG9xems4aGIifQ.VfUo8YBLvfuqfMlBMfGn5g`} alt="" />
      </div>
    )
  }

  const viewDetails = ({
    /* cell: {
      row: {
        original: {
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
        }
      }
    } */
  }) => {
    return (
      <button
        className="icon-button"
        /* onClick={() => {
          setDrawContent(
            <UserStats
              date_joined={date_joined}
              mobile_os={mobile_os}
              tracker={tracker}
              points={points}
              rank={rank}
              last_activity={last_activity}
              total_leagues={total_leagues}
              rewards={rewards}
              last_session={last_session}
              created_leagues={created_leagues}
            />
          )
        }} */
        >
        <IconSearch />
      </button>
    )
  }

  return (
    <Dashboard title="Activities">
      <div>
        <div className="flex ai-c">
          <h1 className="light mb-0 mr-2">Your activities</h1>
          <button
            className="button alt small mt-1"
            //onClick={NewLeagueForm}
            >
            Add new
          </button>
        </div>
      </div>
      <div className="mt-4 overflow-x-auto">
        <TableContainer
          columns={[
            { Header: 'Location', accessor: 'meeting_point', Cell: displayImage },
            { Header: 'Name', accessor: 'name' },
            { Header: 'Description', accessor: 'description' },
            { Header: 'Date', accessor: 'date', Cell: toChipCell },
            { Header: 'Type', accessor: 'type', Cell: toChipCell },
            { Header: ' ', Cell: viewDetails }
          ]}
          fetch={() => Promise.resolve(dummy)}
        />
      </div>
    </Dashboard>
  )
}
