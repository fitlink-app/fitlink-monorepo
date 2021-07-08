import { useState } from 'react'
import Dashboard from '../../components/layouts/Dashboard'
import TableContainer from '../../components/Table/TableContainer'
import { toChipCell } from '../../components/Table/helpers'
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
        <img
          src={`https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/${value.coordinates[1]},${value.coordinates[0]},15,0,0/400x200?access_token=pk.eyJ1IjoibHVrZS1maXRsaW5rYXBwIiwiYSI6ImNrbzBhNWtweTBkcW8yd29idG9xems4aGIifQ.VfUo8YBLvfuqfMlBMfGn5g`}
          alt=""
        />
      </div>
    )
  }

  const viewDetails = ({
    cell: {
      row: {
        original: {
          name,
          description,
          date,
          cost,
          organizer_name,
          organizer_url,
          organizer_telephone,
          organizer_email,
          organizer_image,
          meeting_point_text,
          type,
          meeting_point,
          images
        }
      }
    }
  }) => {
    return (
      <button
        className="icon-button"
        onClick={() => {
          setWarning(true)
          setDrawContent(
            <ActivityForm
              current={{
                name: name,
                description: description,
                date: date,
                cost: cost,
                images: images,
                organizer_name: organizer_name,
                organizer_url: organizer_url,
                organizer_telephone: organizer_telephone,
                organizer_email: organizer_email,
                organizer_image: organizer_image?.url || '',
                meeting_point_text: meeting_point_text,
                lat: meeting_point.coordinates[0],
                lng: meeting_point.coordinates[1],
                type: {
                  label: type.charAt(0).toUpperCase() + type.slice(1),
                  value: type
                }
              }}
            />
          )
        }}>
        <IconSearch />
      </button>
    )
  }

  const NewActivityForm = () => {
    setWarning(true)
    setDrawContent(<ActivityForm />)
  }

  return (
    <Dashboard title="Activities">
      <div>
        <div className="flex ai-c">
          <h1 className="light mb-0 mr-2">Your activities</h1>
          <button className="button alt small mt-1" onClick={NewActivityForm}>
            Add new
          </button>
        </div>
      </div>
      <div className="mt-4 overflow-x-auto">
        <TableContainer
          columns={[
            {
              Header: 'Location',
              accessor: 'meeting_point',
              Cell: displayImage
            },
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
