import { useContext, useState } from 'react'
import Dashboard from '../components/layouts/Dashboard'
import TableContainer from '../components/Table/TableContainer'
import {
  toChipCell,
  toMapImage,
  toOwnerCell
} from '../components/Table/helpers'
import { AnimatePresence } from 'framer-motion'
import Drawer from '../components/elements/Drawer'
import Checkbox from '../components/elements/Checkbox'
import ActivityForm from '../components/forms/ActivityForm'
import ConfirmDeleteForm from '../components/forms/ConfirmDeleteForm'
import { Activity } from '../../../api/src/modules/activities/entities/activity.entity'
import { AuthContext } from '../context/Auth.context'
import { timeout } from '../helpers/timeout'

export default function page() {
  const { api, primary, focusRole, fetchKey, endpointPrefix } = useContext(
    AuthContext
  )
  const [drawContent, setDrawContent] = useState<
    React.ReactNode | undefined | false
  >(false)
  const [warning, setWarning] = useState(false)
  const [wide, setWide] = useState(true)
  const [includeUsers, setIncludeUsers] = useState(true)
  const [refresh, setRefresh] = useState(0)

  const viewDetails = ({
    cell: {
      row: { original }
    }
  }) => {
    return (
      <div className="text-right w-20">
        <button
          className="button alt small"
          onClick={() => DeleteForm(original)}>
          Delete
        </button>
        <button
          className="button small ml-1"
          onClick={() => {
            setWarning(true)
            setWide(true)
            setDrawContent(
              <ActivityForm current={original} onSave={closeDrawer(1000)} />
            )
          }}>
          Edit
        </button>
      </div>
    )
  }

  const NewActivityForm = () => {
    setWarning(true)
    setWide(true)
    setDrawContent(<ActivityForm current={{}} onSave={closeDrawer(1000)} />)
  }

  const closeDrawer = (ms = 0) => async () => {
    if (ms) {
      await timeout(ms)
    }
    setRefresh(Date.now())
    setDrawContent(null)
  }

  const DeleteForm = (fields) => {
    setWarning(true)
    setWide(false)
    setDrawContent(
      <ConfirmDeleteForm
        onDelete={closeDrawer(1000)}
        onCancel={closeDrawer()}
        current={fields}
        mutation={(id) =>
          api.delete(`${endpointPrefix}/activities/:activityId`, {
            activityId: id,
            teamId: primary.team,
            organisationId: primary.organisation
          })
        }
        title="Delete activity"
        message={`
          Are you sure you want to delete this activity?
        `}
      />
    )
  }

  return (
    <Dashboard title="Activities">
      <div>
        <div className="flex ai-c">
          <h1 className="light mb-0 mr-2">
            {primary.superAdmin ? 'Global' : 'Your'} activities
          </h1>
          <button className="button alt small mt-1" onClick={NewActivityForm}>
            Add new
          </button>
        </div>
      </div>
      <div className="mt-4 overflow-x-auto">
        {focusRole === 'app' && (
          <div className="p-2">
            <Checkbox
              name="include_user_activities"
              checked={includeUsers}
              label="Include activities created by users"
              onChange={() => {
                setIncludeUsers(!includeUsers)
              }}
            />
          </div>
        )}
        <TableContainer
          columns={[
            { Header: 'Location', accessor: 'meeting_point', Cell: toMapImage },
            { Header: 'Name', accessor: 'name' },
            { Header: 'Description', accessor: 'description' },
            { Header: 'Creator', accessor: 'owner.name', Cell: toOwnerCell },
            { Header: 'Date', accessor: 'date', Cell: toChipCell },
            { Header: 'Type', accessor: 'type', Cell: toChipCell },
            { Header: ' ', Cell: viewDetails }
          ]}
          fetch={(limit, page) => {
            if (focusRole === 'app') {
              return api.list<Activity>('/activities/global', {
                limit,
                page,
                exclude_user_activities: includeUsers ? '0' : '1'
              })
            }
            if (focusRole === 'organisation') {
              return api.list<Activity>(
                '/organisations/:organisationId/activities',
                {
                  organisationId: primary.organisation,
                  limit,
                  page
                }
              )
            }

            if (focusRole === 'team') {
              return api.list<Activity>('/teams/:teamId/activities', {
                teamId: primary.team,
                limit,
                page
              })
            }

            return Promise.resolve({
              results: [],
              total: 0,
              page_total: 0
            })
          }}
          fetchName={`activities_${includeUsers}_${fetchKey}`}
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
