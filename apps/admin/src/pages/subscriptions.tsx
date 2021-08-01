import { AnimatePresence } from 'framer-motion'
import { useState, useContext } from 'react'
import Drawer from '../components/elements/Drawer'
import CreateSubscription from '../components/forms/CreateSubscription'
import Dashboard from '../components/layouts/Dashboard'
import TableContainer from '../components/Table/TableContainer'
import {
  boolToIcon,
  toDateCell,
  toJoinCells
} from '../components/Table/helpers'
// eslint-disable-next-line @typescript-eslint/no-var-requires
import { AuthContext } from '../context/Auth.context'
import { Subscription } from '@fitlink/api/src/modules/subscriptions/entities/subscription.entity'
import { timeout } from '../helpers/timeout'
import ConfirmDeleteForm from '../components/forms/ConfirmDeleteForm'
import ConfirmForm from '../components/forms/ConfirmForm'

export default function SubscriptionsPage() {
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

  const CreateSubscriptionForm = () => {
    setWarning(true)
    setWide(false)
    setDrawContent(<CreateSubscription onSave={closeDrawer(1000)} />)
  }

  const EditSubscriptionForm = (fields) => {
    setWarning(true)
    setWide(false)
    setDrawContent(
      <CreateSubscription onSave={closeDrawer(1000)} current={fields} />
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
        title="Delete subscription"
        requireConfirmText="DELETE"
        message={`
          Are you sure you want to delete this subscription?
          This will reallocate the seats being used to the organisation's default subscription.
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
        onClick={() =>
          ConfirmForm({
            message:
              'Are you sure you want to make this the default subscription?',
            mutation: (current) =>
              api.put<Subscription>('/subscriptions/:subscriptionId', {
                subscriptionId: current.id,
                payload: {}
              })
          })
        }>
        Make Default
      </button>
      <button
        className="button small ml-1"
        onClick={() => EditSubscriptionForm(original)}>
        Edit
      </button>
    </div>
  )

  const { api } = useContext(AuthContext)

  return (
    <Dashboard title="Settings Users">
      <div className="flex ai-c">
        <h1 className="light mb-0 mr-2">Manage subscriptions</h1>
        <button
          className="button alt small mt-1"
          onClick={CreateSubscriptionForm}>
          Create New Subscription
        </button>
      </div>

      <div className="mt-4 overflow-x-auto">
        <TableContainer
          columns={[
            { Header: 'Billing Entity', accessor: 'billing_entity' },
            {
              Header: 'Billing Name',
              accessor: 'billing_first_name',
              Cell: toJoinCells(['billing_first_name', 'billing_last_name'])
            },
            { Header: 'Organisation', accessor: 'organisation.name' },
            {
              Header: 'Default Subscription',
              accessor: 'default',
              Cell: boolToIcon
            },
            { Header: 'Plan Type', accessor: 'type' },
            { Header: 'Created', accessor: 'created_at', Cell: toDateCell },
            { Header: 'Updated', accessor: 'updated_at', Cell: toDateCell },
            { Header: ' ', Cell: cellActions }
          ]}
          fetch={(limit, page) =>
            api.list<Subscription>('/subscriptions', {
              limit,
              page
            })
          }
          fetchName="subscriptions"
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
