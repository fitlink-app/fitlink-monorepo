import { useState } from 'react'
import Card from '../../../components/elements/Card'
import Input from '../../../components/elements/Input'
import Select from '../../../components/elements/Select'
import Checkbox from '../../../components/elements/Checkbox'
import Dashboard from '../../../components/layouts/Dashboard'

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

  return (
    <Dashboard title="Settings">
      <h1 className="light">Settings</h1>
      <div className="row mt-2">
        <div className="col-12 col-lg-6 mt-2">
          <Card className="p-3 card--stretch pb-4">
            <h2 className="h5 color-light-grey m-0">
              General account settings
            </h2>
            <Input
              name="company"
              placeholder="Company name"
              label="Company name"
              value={company}
              onChange={(v) => setCompany(v)}
            />
            <Select
              id="currency"
              isSearchable={false}
              label="Currency"
              value={currenct}
              options={currencies}
              onChange={(v) => setCurrency(v)}
            />
          </Card>
        </div>
        <div className="col-12 col-lg-6 mt-2">
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
            <p className="pl-6">
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
            <p className="pl-6">
              Receive information on app updates, new rewards, and tips to keep
              you inspired and motivated to achieve your wellness goals.
            </p>
          </Card>
        </div>
      </div>
    </Dashboard>
  )
}
