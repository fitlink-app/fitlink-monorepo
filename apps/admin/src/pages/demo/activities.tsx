import { useState } from 'react'
import Dashboard from '../../components/layouts/Dashboard'
import TableContainer from '../../components/Table/TableContainer'
import {
  toChipCell
} from '../../components/Table/helpers'
import IconSearch from '../../components/icons/IconSearch'
import { AnimatePresence } from 'framer-motion'
import Drawer from '../../components/elements/Drawer'
import ActivityForm from '../../components/forms/ActivityForm'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const dummy = require('../../services/dummy/activities.json')

export default function components() {
  const [drawContent, setDrawContent] = useState<
    React.ReactNode | undefined | false
  >(false)
  const [warning, setWarning] = useState(false)
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

  const NewActivityForm = () => {
    setWarning(true)
    setDrawContent(
      <ActivityForm />
    )
  }

  return (
    <Dashboard title="Activities">
      <div>
        <div className="flex ai-c">
          <h1 className="light mb-0 mr-2">Your activities</h1>
          <button
            className="button alt small mt-1"
            onClick={NewActivityForm}
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
      <AnimatePresence initial={false}>
        {drawContent && (
          <Drawer
            remove={() => setDrawContent(null)}
            key="drawer"
            warnBeforeClose={warning}>
            {drawContent}
          </Drawer>
        )}
      </AnimatePresence>
    </Dashboard>
  )
}
