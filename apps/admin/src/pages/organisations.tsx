import { AnimatePresence } from 'framer-motion'
import { useState, useContext } from 'react'
import Drawer from '../components/elements/Drawer'
import CreateOrganisation from '../components/forms/CreateOrganisation'
import Dashboard from '../components/layouts/Dashboard'
import TableContainer from '../components/Table/TableContainer'
import { toDateCell, toOtherCell } from '../components/Table/helpers'
// eslint-disable-next-line @typescript-eslint/no-var-requires
import { AuthContext } from '../context/Auth.context'
import { Organisation } from '@fitlink/api/src/modules/organisations/entities/organisation.entity'
import { timeout } from '../helpers/timeout'
import ConfirmDeleteForm from '../components/forms/ConfirmDeleteForm'

export default function OrganisationsPage() {
  const [drawContent, setDrawContent] = useState<
    React.ReactNode | undefined | false
  >(false)
  const [warning, setWarning] = useState(false)
  const [wide, setWide] = useState(false)
  const [refresh, setRefresh] = useState(0)

  const closeDrawer = (ms = 0) => async () => {
    if (ms) {
      await timeout(ms)
    }
    setRefresh(Date.now())
    setDrawContent(null)
  }

  const CreateOrganisationForm = () => {
    setWarning(true)
    setWide(false)
    setDrawContent(<CreateOrganisation onSave={closeDrawer(1000)} />)
  }

  const EditOrganisationForm = (fields) => {
    setWarning(true)
    setWide(false)
    setDrawContent(
      <CreateOrganisation onSave={closeDrawer(1000)} current={fields} />
    )
  }

  const DeleteForm = (fields) => {
    setWarning(true)
    setWide(false)
    setDrawContent(
      <ConfirmDeleteForm
        onDelete={closeDrawer(1000)}
        onCancel={closeDrawer()}
        current={fields}
        title="Delete organisation"
        requireConfirmText="DELETE"
        message={`
          Are you sure you want to delete this organisation?
          This will permanently remove all associated teams, subscriptions, leagues, activities & more.
        `}
      />
    )
  }

  const showAvatar = ({
    cell: {
      row: {
        original: { avatar, name }
      }
    }
  }) => {
    return (
      <div className="avatar">
        <span>{`${name[0]}`}</span>
        {avatar && <img src={avatar.url_128x128} alt={name} />}
      </div>
    )
  }

  const cellActions = ({
    cell: {
      row: { original }
    }
  }) => (
    <div className="text-right">
      <button className="button alt small" onClick={() => DeleteForm(original)}>
        Delete
      </button>
      <button
        className="button small ml-1"
        onClick={() => EditOrganisationForm(original)}>
        Edit
      </button>
    </div>
  )

  const { api } = useContext(AuthContext)

  return (
    <Dashboard title="Settings Users">
      <div className="flex ai-c">
        <h1 className="light mb-0 mr-2">Manage organisations</h1>
        <button
          className="button alt small mt-1"
          onClick={CreateOrganisationForm}>
          Create New Organisation
        </button>
      </div>

      <div className="mt-4 overflow-x-auto">
        <TableContainer
          columns={[
            { Header: ' ', accessor: 'avatar', Cell: showAvatar },
            { Header: 'Name', accessor: 'name' },
            { Header: 'Users', accessor: 'user_count' },
            {
              Header: 'Type',
              accessor: 'type',
              Cell: toOtherCell('other', 'type_other')
            },
            { Header: 'Created', accessor: 'created_at', Cell: toDateCell },
            { Header: 'Updated', accessor: 'updated_at', Cell: toDateCell },
            { Header: ' ', Cell: cellActions }
          ]}
          fetch={(limit, page) =>
            api.list<Organisation>('/organisations', {
              limit,
              page
            })
          }
          fetchName="organisations"
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
