import { AnimatePresence } from 'framer-motion'
import { useState, useContext, useEffect, useRef } from 'react'
import Drawer from '../../../components/elements/Drawer'
import CreateSubscriptionUser from '../../../components/forms/CreateSubscriptionUser'
import Dashboard from '../../../components/layouts/Dashboard'
import TableContainer from '../../../components/Table/TableContainer'
import {
  boolToIcon,
  toDateCell,
  toJoinCells
} from '../../../components/Table/helpers'
// eslint-disable-next-line @typescript-eslint/no-var-requires
import { AuthContext } from '../../../context/Auth.context'
import { Subscription } from '@fitlink/api/src/modules/subscriptions/entities/subscription.entity'
import { timeout } from '../../../helpers/timeout'
import ConfirmDeleteForm from '../../../components/forms/ConfirmDeleteForm'
import ConfirmForm from '../../../components/forms/ConfirmForm'
import Head from 'next/head'
import { BillingPlanStatus } from '@fitlink/api/src/modules/subscriptions/subscriptions.constants'
import { useRouter } from 'next/router'
import { ApiResult } from '../../../../../common/react-query/types'
import { useQuery, useQueryClient } from 'react-query'

const enumToBool = ({ value }) => {
  return boolToIcon({
    value: value === BillingPlanStatus.Active
  })
}

export default function SubscriptionsUsersPage() {
  const [drawContent, setDrawContent] = useState<
    React.ReactNode | undefined | false
  >(false)
  const [warning, setWarning] = useState(false)
  const [wide, setWide] = useState(false)
  const [refresh, setRefresh] = useState(0)
  const router = useRouter()
  const { api, primary, focusRole } = useContext(AuthContext)
  const subscriptionData = useRef<Subscription>()
  const subscriptionId = (router.query.id as unknown) as string

  const subscription: ApiResult<Subscription> = useQuery(
    subscriptionId || 'subscription_id',
    () =>
      api.get<Subscription>(
        '/subscriptions/:subscriptionId',
        {
          subscriptionId
        },
        {
          primary,
          useRole: focusRole
        }
      ),
    {
      enabled: false
    }
  )

  const client = useQueryClient()

  useEffect(() => {
    if (subscriptionId) {
      subscription.refetch()
    }
  }, [subscriptionId])

  useEffect(() => {
    subscriptionData.current = subscription.data
  }, [subscription.dataUpdatedAt])

  if (!subscriptionId) {
    return <>Loading...</>
  }

  const closeDrawer = (ms = 0) => async () => {
    if (ms) {
      await timeout(ms)
    }
    setRefresh(Date.now())
    setDrawContent(null)
  }

  const AddUserToSubscriptionForm = () => {
    setWarning(true)
    setWide(false)
    setDrawContent(
      <CreateSubscriptionUser
        onSave={closeDrawer(1000)}
        current={{
          subscription: subscription.data,
          user: {}
        }}
      />
    )
  }

  const EditSubscriptionUserForm = (fields) => {
    setWarning(true)
    setWide(false)
    setDrawContent(
      <CreateSubscriptionUser onSave={closeDrawer(1000)} current={fields} />
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
        mutation={(id) =>
          api.delete(
            '/subscriptions/:subscriptionId/users/:userId',
            {
              subscriptionId,
              userId: id
            },
            {
              primary,
              useRole: focusRole
            }
          )
        }
        title={`Remove ${fields.name}`}
        message={`
          Are you sure you want to remove this user from the subscription?
          If the user still belongs to a team within this organisation, they will be moved to the default subscription.
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
      <button
        className="button small ml-1"
        onClick={async () => {
          if (subscriptionData.current) {
            DeleteForm(original)
          }
        }}>
        Remove from Subscription
      </button>
    </div>
  )

  return (
    <Dashboard title="Settings Users">
      <Head>
        <script src="https://js.chargebee.com/v2/chargebee.js"></script>
      </Head>

      <div className="flex ai-c">
        <h1 className="light mb-0 mr-2">Manage subscription users</h1>
        <button
          className="button alt small mt-1"
          onClick={() => {
            AddUserToSubscriptionForm()
          }}>
          Move User To Subscription
        </button>
      </div>

      <div className="mt-4 overflow-x-auto">
        <TableContainer
          columns={[
            { Header: 'Avatar', accessor: 'avatar', Cell: showAvatar },
            { Header: 'Name', accessor: 'name' },
            { Header: 'Created', accessor: 'created_at', Cell: toDateCell },
            { Header: 'Updated', accessor: 'updated_at', Cell: toDateCell },
            { Header: ' ', Cell: cellActions }
          ]}
          fetch={(limit, page) => {
            if (subscriptionId) {
              return api.list<Subscription>(
                '/subscriptions/:subscriptionId/users',
                {
                  limit,
                  page,
                  subscriptionId
                },
                {
                  primary,
                  useRole: focusRole
                }
              )
            } else {
              return Promise.resolve({
                results: [],
                total: 0,
                page_total: 0
              })
            }
          }}
          fetchName={`subscriptions_users_${subscriptionId}`}
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
