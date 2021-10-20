import { useState, useContext } from 'react'
import Dashboard from '../components/layouts/Dashboard'
import { AuthContext } from '../context/Auth.context'
import TableContainer from '../components/Table/TableContainer'
import { boolToIcon, toID, toJSON } from '../components/Table/helpers'
import { AnimatePresence } from 'framer-motion'
import Drawer from '../components/elements/Drawer'
import HealthActivityDetailForm from '../components/forms/HealthActivityDetailForm'
import { timeout } from '../helpers/timeout'
import { HealthActivityDebug } from '@fitlink/api/src/modules/health-activities/entities/health-activity-debug.entity'

export default function HealthActivitiesDebug() {
  const [drawContent, setDrawContent] = useState<
    React.ReactNode | undefined | false
  >(false)
  const [warning, setWarning] = useState(false)
  const [wide, setWide] = useState(true)
  const [refresh, setRefresh] = useState(0)

  const ViewDetailForm = (fields) => {
    setWarning(true)
    setWide(false)
    setDrawContent(<HealthActivityDetailForm current={fields} />)
  }

  const cellActions = ({
    cell: {
      row: { original }
    }
  }) => {
    return (
      <div className="text-right flex jc-e">
        <button
          className="button small ml-2"
          onClick={() => ViewDetailForm(original)}>
          View
        </button>
      </div>
    )
  }

  const { api, fetchKey } = useContext(AuthContext)
  return (
    <Dashboard title="Health Activities Debug">
      <div className="flex ai-c jc-sb">
        <div className="flex ai-c">
          <h1 className="light mb-0 mr-2">Health Activities Debug</h1>
        </div>
      </div>
      <div className="mt-4 overflow-x-auto">
        <TableContainer
          columns={[
            {
              Header: 'Succeeded',
              accessor: 'health_activity',
              Cell: boolToIcon
            },
            { Header: 'UID', accessor: 'user', Cell: toID },
            { Header: ' ', Cell: cellActions }
          ]}
          fetch={(limit, page) =>
            api.list<HealthActivityDebug>('/health-activities-debug', {
              limit,
              page
            })
          }
          fetchName={`debug_${fetchKey}`}
          refresh={refresh}
        />
      </div>

      <AnimatePresence initial={false}>
        {drawContent && (
          <Drawer
            remove={() => setDrawContent(null)}
            key="drawer"
            warnBeforeClose={warning}
            wide={wide}>
            {drawContent}
          </Drawer>
        )}
      </AnimatePresence>
    </Dashboard>
  )
}
