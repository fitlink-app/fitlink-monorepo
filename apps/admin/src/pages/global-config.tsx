import { useContext, useEffect, useState } from 'react'
import Button from '../components/elements/Button'
import Card from '../components/elements/Card'
import Input from '../components/elements/Input'
import Select from '../components/elements/Select'
import Feedback from '../components/elements/Feedback'
import Checkbox from '../components/elements/Checkbox'
import Dashboard from '../components/layouts/Dashboard'
import ImageSelect from '../components/elements/ImageSelect'
import { AuthContext } from '../context/Auth.context'
import { useQuery } from 'react-query'
import { useMutation } from 'react-query'

const currencies = [
  {
    value: 'GBP',
    label: 'GBP - British Pound'
  },
  {
    value: 'EUR',
    label: 'EUR - Euro'
  },
  {
    value: 'USD',
    label: 'USD - US Dollar'
  },
  {
    value: 'AUD',
    label: 'AUD - Australian Dollar'
  },
  {
    value: 'EAD',
    label: 'EAD - Emirati Dirham'
  }
]

export default function components() {
  const [company, setCompany] = useState('My Company LTD')
  const [currenct, setCurrency] = useState(currencies[0])
  const { api } = useContext(AuthContext)

  const strava = useQuery(
    'strava',
    () => {
      return api.get<{
        id: string
        callback_url: string
      }>('/providers/strava/webhook/view')
    },
    {
      refetchOnWindowFocus: false
    }
  )

  const registerStrava = useMutation('register_strava', () =>
    api.post('/providers/strava/webhook/register')
  )

  const deregisterStrava = useMutation('deregister_strava', () =>
    api.delete('/providers/strava/webhook/register/:id', {
      id: strava.data.id
    })
  )

  useEffect(() => {
    if (deregisterStrava.isSuccess || registerStrava.isSuccess) {
      strava.refetch()
    }
  }, [deregisterStrava.isSuccess, registerStrava.isSuccess])

  const error = strava.error || registerStrava.error || deregisterStrava.error

  return (
    <Dashboard title="Settings">
      <h1 className="light">Settings</h1>
      <div className="row mt-2 ai-s">
        <div className="col-12 col-md-6 col-xl-5 col-hd-4 mt-2">
          <Card className="p-3 card--stretch pb-4">
            <h2 className="h5 color-light-grey m-0">Strava settings</h2>

            {!!error && (
              <Feedback message={JSON.stringify(error)} type="error" />
            )}

            {registerStrava.isLoading && 'Creating Strava subscription...'}

            {strava.isFetched ? (
              <small>
                {strava.data && (
                  <>
                    <div>
                      <strong>ID </strong>
                      {strava.data.id}
                    </div>
                    <div>
                      <strong>URL </strong>
                      {strava.data.callback_url}
                    </div>
                  </>
                )}
                <div className="mt-2">
                  {strava.data && strava.data.id ? (
                    <Button
                      onClick={() => deregisterStrava.mutate()}
                      label="Delete Subscription"
                    />
                  ) : (
                    <Button
                      onClick={() => registerStrava.mutate()}
                      label="Create Subscription"
                    />
                  )}
                </div>
              </small>
            ) : (
              'Loading strava webhook subscription...'
            )}

            <p className="mt-2 mb-2">
              The Strava subscription must be setup in order to receive webhook
              events and process users' Strava data.{' '}
              <a
                href="https://developers.strava.com/docs/webhooks/"
                target="_blank"
                rel="nofollow noopener">
                More information
              </a>
            </p>
          </Card>
        </div>
        {/* <div className="col-12 col-md-6 col-xl-5 col-hd-4 mt-2">
          <Card className="p-3 card--stretch">
            <h3 className="h5 color-light-grey mb-3">
              Newsletter subscriptions
            </h3>
            <Checkbox
              label="Admin newsletter"
              name="admin"
              checked={true}
              showSwitch={true}
              onChange={(v) => {}}
            />
            <p className="pl-7 pl-md-6">
              Receive important information, updates, and helpful tips to boost
              your employee wellness campaigns.
            </p>
            <Checkbox
              label="User newsletter"
              name="admin"
              checked={true}
              showSwitch={true}
              onChange={(v) => {}}
            />
            <p className="pl-7 pl-md-6">
              Receive information on app updates, new rewards, and tips to keep
              you inspired and motivated to achieve your wellness goals.
            </p>
          </Card>
        </div> */}
      </div>
    </Dashboard>
  )
}
