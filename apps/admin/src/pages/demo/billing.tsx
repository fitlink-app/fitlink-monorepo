import { AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import Card from '../../components/elements/Card'
import Drawer from '../../components/elements/Drawer'
import BillingForm from '../../components/forms/BillingForm'
import Dashboard from '../../components/layouts/Dashboard'

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

export default function components() {
  const [drawContent, setDrawContent] = useState<
    React.ReactNode | undefined | false
  >(false)
  const [warning, setWarning] = useState(false)


  const EditBilling = () => {
    setWarning(true)
    setDrawContent(
      <BillingForm
        {...billingInfo}
       />
    )
  }

  return (
    <Dashboard title="Billing">
      <h1 className="light">Billing</h1>
      <div className="row mt-2">
        <div className="col-12 col-lg-6 mt-2">
          <Card className="p-3 card--stretch">
          </Card>
        </div>
        <div className="col-12 col-lg-6 mt-2">
          <Card className="p-3 card--stretch">
            <h2 className="h5 color-light-grey m-0">Payment information</h2>
            <div className="mt-2">
              <button className="button">Update payment informatin</button>
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
              <button className="button" onClick={EditBilling}>Update billing address</button>
            </div>
          </Card>
        </div>
      </div>
      <AnimatePresence initial={false}>
        {drawContent && (
          <Drawer
            remove={() => setDrawContent(null)}
            key="drawer"
            warnBeforeClose={warning}
            >
            {drawContent}
          </Drawer>
        )}
      </AnimatePresence>
    </Dashboard>
  )
}
