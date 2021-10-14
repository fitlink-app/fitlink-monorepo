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
import { Provider } from '@fitlink/api/src/modules/providers/entities/provider.entity'

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

  const providers = useQuery('providers', () => {
    return api.get<Provider[]>('/me/providers')
  })

  const config = useQuery('environment', () => api.get('/app/config'))

  useEffect(() => {
    if (deregisterStrava.isSuccess || registerStrava.isSuccess) {
      strava.refetch()
    }
  }, [deregisterStrava.isSuccess, registerStrava.isSuccess])

  const error = strava.error || registerStrava.error || deregisterStrava.error

  async function authStrava() {
    const { oauth_url } = await api.get('/providers/strava/auth')
    window.open(oauth_url)
  }

  async function authFitbit() {
    const { oauth_url } = await api.get('/providers/fitbit/auth')
    window.open(oauth_url)
  }

  async function revokeStrava() {
    await api.delete('/providers/strava', {})
    providers.refetch()
  }

  async function revokeFitbit() {
    await api.delete('/providers/fitbit', {})
    providers.refetch()
  }

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
        <div className="col-12 col-md-6 col-xl-5 col-hd-4 mt-2">
          <Card className="p-3 card--stretch pb-4">
            <h2 className="h5 color-light-grey m-0">Useful links</h2>
            <div className="pt-2">
              <ul>
                <li>
                  <a
                    href="https://analytics.google.com/analytics/web/#/p277435002/reports/reportinghub"
                    target="_blank"
                    rel="noopener nofollow">
                    Google Analytics
                  </a>
                </li>
              </ul>
            </div>
          </Card>
        </div>
        <div className="col-12 col-md-6 col-xl-5 col-hd-4 mt-2">
          <Card className="p-3 card--stretch pb-4">
            <h2 className="h5 color-light-grey m-0">
              Strava &amp; FitBit Test
            </h2>
            {providers.isSuccess && (
              <>
                <h3 className="h6 color-light-grey m-0">Authenticated:</h3>
                <ul>
                  {providers.data.map((e) => {
                    return (
                      <li>
                        {e.type} {e.updated_at}{' '}
                      </li>
                    )
                  })}
                </ul>
              </>
            )}
            <div className="pt-2">
              <Button
                onClick={() => authFitbit()}
                label="Authenticate FitBit"
                className="mr-1"
              />
              <Button
                onClick={() => authStrava()}
                label="Authenticate Strava"
              />
            </div>
            <div className="pt-2">
              <Button
                onClick={() => revokeFitbit()}
                label="Revoke FitBit"
                className="alt mr-1"
              />
              <Button
                className="alt"
                onClick={() => revokeStrava()}
                label="Revoke Strava"
              />
            </div>
          </Card>
        </div>
        <div className="col-12 col-md-12 col-xl-12 col-hd-4 mt-2">
          <Card className="p-3 card--stretch">
            <h3 className="h5 color-light-grey mb-3">
              Environmental variables
            </h3>
            <table>
              {config.isFetched &&
                Object.keys(config.data).map((key) => {
                  return (
                    <tr>
                      <th className="text-right pr-2">{key}:</th>
                      <td>{config.data[key]}</td>
                    </tr>
                  )
                })}
            </table>
          </Card>
        </div>
      </div>
    </Dashboard>
  )
}
