import { AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import Card from '../../components/elements/Card'
import Drawer from '../../components/elements/Drawer'
import BillingForm from '../../components/forms/BillingForm'
import IconCheck from '../../components/icons/IconCheck'
import IconVisa from '../../components/icons/IconVisa'
import Dashboard from '../../components/layouts/Dashboard'
import { format, endOfMonth } from 'date-fns'
import TableContainer from '../../components/Table/TableContainer'
import { toChipCell, toDateCell } from '../../components/Table/helpers'
import IconDownload from '../../components/icons/IconDownload'

const billingInfo = {
  firstname: 'Paul',
  lastname: 'Gosnell',
  address1: '20-22 Wenlock Road',
  address2: '',
  city: 'London',
  state: 'London',
  country: {
    value: 'UK',
    label: 'United Kingdom'
  },
  postalcode: 'N1 7GU'
}

const invoices = {
  results: [
    {
      id: 'fitlink-202106-87',
      status: 'paid',
      amount: 21.88,
      due_date: '2021-06-01T00:00:00.220Z'
    },
    {
      id: 'fitlink-202105-87',
      status: 'paid',
      amount: 20.0,
      due_date: '2021-05-01T00:00:00.220Z'
    },
    {
      id: 'fitlink-202105-87',
      status: 'paid',
      amount: 15.94,
      due_date: '2021-04-01T00:00:00.220Z'
    }
  ],
  total: 3,
  page_total: 1
}

export default function page() {
  const [drawContent, setDrawContent] = useState<
    React.ReactNode | undefined | false
  >(false)
  const [warning, setWarning] = useState(false)

  const EditBilling = () => {
    setWarning(true)
    setDrawContent(<BillingForm {...billingInfo} />)
  }

  const toCurrency = ({ value }) => {
    return '£' + value.toLocaleString(undefined, { minimumFractionDigits: 2 })
  }

  const Download = () => {
    return <IconDownload width="24px" height="24px" />
  }

  return (
    <Dashboard title="Billing" linkPrefix="/demo">
      <h1 className="light">Billing</h1>
      <div className="row mt-2">
        <div className="col-12 col-lg-6 mt-2">
          <Card className="p-3 card--stretch">
            <div className="flex ai-c mt-1">
              <p className="mb-0 mr-2">
                <small>
                  Current billing period ending{' '}
                  {format(endOfMonth(new Date()), 'do MMMM, yyyy')}
                </small>
              </p>
              <h2 className="h1 light mb-0 ml-a unbilled-amount">£35.01</h2>
            </div>
            <table className="static-table static-table--invoice">
              <tbody>
                <tr>
                  <td>Active users</td>
                  <td>11</td>
                  <td className="text-right">£2.00</td>
                  <td className="text-right pr-1">£22.00</td>
                </tr>
                <tr>
                  <td>Ecologi, Tree planting reward</td>
                  <td>100</td>
                  <td className="text-right">$0.18</td>
                  <td className="text-right pr-1">($18.00) £13.01</td>
                </tr>
              </tbody>
            </table>
            <hr />
            <h3 className="h5 color-light-grey m-0">Previous invoices</h3>
            <div className="invoices mt-2">
              <TableContainer
                columns={[
                  { Header: 'Invoice', accessor: 'id' },
                  { Header: 'Status', accessor: 'status', Cell: toChipCell },
                  { Header: 'Amount', accessor: 'amount', Cell: toCurrency },
                  {
                    Header: 'Due date',
                    accessor: 'due_date',
                    Cell: toDateCell
                  },
                  { Header: ' ', Cell: Download }
                ]}
                fetch={() => Promise.resolve(invoices)}
                fetchName="billing"
              />
            </div>
          </Card>
        </div>
        <div className="col-12 col-lg-6 mt-2">
          <Card className="p-3 card--stretch">
            <h2 className="h5 color-light-grey m-0">Payment information</h2>
            <div className="row mt-2">
              <div className="col-2 text-center color-light-grey">
                <IconVisa width="32px" height="32px" />
              </div>
              <div className="col">
                <h4 className="light mb-0">************4242</h4>
                <p>Expiry date: 12/2029</p>
              </div>
              <div className="col flex ai-c">
                <div className="chip">Primary</div>
                <div className="confirmed ml-1">
                  <IconCheck />
                </div>
              </div>
            </div>
            <div className="mt-2">
              <button className="button">Update payment information</button>
            </div>
            <hr />
            <h3 className="h5 color-light-grey m-0">Billing information</h3>
            <table className="static-table static-table--billing mt-2">
              <tbody>
                <tr>
                  <th>First name</th>
                  <td>{billingInfo.firstname}</td>
                </tr>
                <tr>
                  <th>Last name</th>
                  <td>{billingInfo.lastname}</td>
                </tr>
                <tr>
                  <th>Address line 1</th>
                  <td>{billingInfo.address1}</td>
                </tr>
                <tr>
                  <th>Address line 2</th>
                  <td>{billingInfo.address2}</td>
                </tr>
                <tr>
                  <th>City</th>
                  <td>{billingInfo.city}</td>
                </tr>
                <tr>
                  <th>State / Province</th>
                  <td>{billingInfo.state}</td>
                </tr>
                <tr>
                  <th>Zip / Postal code</th>
                  <td>{billingInfo.postalcode}</td>
                </tr>
                <tr>
                  <th>Country</th>
                  <td>{billingInfo.country.label}</td>
                </tr>
              </tbody>
            </table>
            <div className="mt-2">
              <button className="button" onClick={EditBilling}>
                Update billing address
              </button>
            </div>
          </Card>
        </div>
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
