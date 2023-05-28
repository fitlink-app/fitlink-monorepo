declare global {
  interface Window {
    tdconv: any;
  }
}
import { AnimatePresence } from 'framer-motion'
import { useEffect, useRef, useState, useContext } from 'react'
import Card from '../../../components/elements/Card'
import Drawer from '../../../components/elements/Drawer'
import BillingForm from '../../../components/forms/BillingForm'
import IconVisa from '../../../components/icons/IconVisa'
import Dashboard from '../../../components/layouts/Dashboard'
import { format, endOfMonth } from 'date-fns'
import TableContainer from '../../../components/Table/TableContainer'
import {
  toChipCell,
  toDateCell,
  toDateCellFromUDate
} from '../../../components/Table/helpers'
import IconDownload from '../../../components/icons/IconDownload'
import { useMutation, useQuery } from 'react-query'
import { AuthContext } from '../../../context/Auth.context'
import { useRouter } from 'next/router'
import { Subscription } from '@fitlink/api/src/modules/subscriptions/entities/subscription.entity'
import {
  PaymentSource,
  Invoice,
  Customer,
  Card as ChargebeeCard,
  Subscription as ChargebeeSubscription
} from 'chargebee-typescript/lib/resources'
import IconMasterCard from '../../../components/icons/IconMasterCard'
import useScript from '../../../hooks/useScript'
import { timeout } from '../../../helpers/timeout'
import { TableLoader } from '../../../components/Table/TableLoader'
import Feedback from '../../../components/elements/Feedback'
import useCurrencyConversion, {
  Currency
} from '../../../hooks/useCurrencyConversion'
import toast from 'react-hot-toast'
import { SubscriptionType } from '@fitlink/api/src/modules/subscriptions/subscriptions.constants'

const PER_UNIT_PRICE = 1 // 1.00 GBP

export default function SubscriptionsBillingPage() {
  const [drawContent, setDrawContent] = useState<
    React.ReactNode | undefined | false
  >(false)
  const [warning, setWarning] = useState(false)
  const { api, focusRole, modeRole, primary, fetchKey } = useContext(
    AuthContext
  )
  const router = useRouter()
  const subscriptionId = useRef<string>()
  const chargeBee = useRef(null)
  const chargeBeeStatus = useScript('https://js.chargebee.com/v2/chargebee.js')

  const closeDrawer = (ms = 0) => async () => {
    if (ms) {
      await timeout(ms)
    }
    setDrawContent(null)
  }

  const EditBilling = () => {
    setWarning(true)
    setDrawContent(
      <BillingForm
        current={subscription.data}
        onSave={async () => {
          await closeDrawer()()
          subscription.refetch()
          chargebeeSubscription.refetch()
        }}
      />
    )
  }

  const toCurrency = ({
    cell: {
      row: { original }
    }
  }) => {
    const amt = original.amount_paid || original.amount_due
    return '£' + amt
      ? amt.toLocaleString(undefined, { minimumFractionDigits: 2 })
      : 0
  }

  const getDownloadLink = useMutation('download_link', (invoiceId: string) => {
    return api.get<{ download_url: string }>(
      '/subscriptions/:subscriptionId/chargebee/invoice-download-link/:invoiceId',
      {
        invoiceId,
        subscriptionId: subscriptionId.current
      },
      {
        useRole: focusRole,
        primary
      }
    )
  })

  const chargebeeSubscription = useQuery(
    `get_chargebee_subscription`,
    () => {
      return api.get<{
        subscription: ChargebeeSubscription
        customer: Customer
        card: ChargebeeCard
      }>(
        '/subscriptions/:subscriptionId/chargebee/subscription',
        {
          subscriptionId: subscriptionId.current
        },
        {
          useRole: focusRole,
          primary
        }
      )
    },
    {
      enabled: false,
      retry: false,
      cacheTime: 0
    }
  )

  const Download = ({
    cell: {
      row: { original }
    }
  }) => {
    return (
      <IconDownload
        className={getDownloadLink.isLoading ? 'opacity-5' : 'pointer'}
        width="24px"
        height="24px"
        onClick={async () => {
          try {
            toast
              .promise(getDownloadLink.mutateAsync(original.id), {
                loading: <b>Generating download link</b>,
                success: <b>Done</b>,
                error: <b>Error</b>
              })
              .then((result) => {
                window.location.href = result.download_url
              })
          } catch (e) {}
        }}
      />
    )
  }

  const paymentSources = useQuery(
    `payment_sources`,
    () => {
      return api.list<PaymentSource>(
        '/subscriptions/:subscriptionId/chargebee/payment-sources',
        {
          subscriptionId: subscriptionId.current
        },
        {
          useRole: focusRole,
          primary
        }
      )
    },
    {
      enabled: false,
      retry: false,
      cacheTime: 0
    }
  )

  const invoices = useQuery(
    `invoices`,
    () => {
      return api.list<Invoice>(
        '/subscriptions/:subscriptionId/chargebee/invoices',
        {
          subscriptionId: subscriptionId.current
        },
        {
          useRole: focusRole,
          primary
        }
      )
    },
    {
      enabled: false,
      retry: false,
      cacheTime: 0
    }
  )

  const subscription = useQuery(
    `subscription`,
    () => {
      return api.get<Subscription>(
        '/subscriptions/:subscriptionId',
        {
          subscriptionId: subscriptionId.current
        },
        {
          useRole: focusRole,
          primary
        }
      )
    },
    {
      enabled: false,
      initialData: {} as Subscription,
      cacheTime: 0
    }
  )

  useEffect(() => {
    if (router.isReady && modeRole) {
      subscriptionId.current = router.query.id as string
      paymentSources.refetch()
      subscription.refetch()
      invoices.refetch()
      chargebeeSubscription.refetch()
    }
  }, [router.isReady, modeRole])

  useEffect(() => {
    if (typeof window !== 'undefined' && chargeBeeStatus === 'ready') {
      const chargebee = (window as any).Chargebee
      if (chargebee) {
        chargeBee.current = chargebee.init({
          site: process.env.NEXT_PUBLIC_CHARGEBEE_SITE || 'fitlinkapp-test',
          publishableKey:
            process.env.NEXT_PUBLIC_CHARGEBEE_PK ||
            'test_tr8k30RHmt46JzSZUElKcu17FgA67OOl7'
        })
      }
    }
  }, [chargeBeeStatus])

  const openChargebeeCheckout = ({ id }: Partial<Subscription>) => {
    if (chargeBee && chargeBee.current) {
        chargeBee.current.openCheckout({
            hostedPage: async () => {
                try {
                    const data = await api.get(
                        '/subscriptions/:subscriptionId/chargebee/hosted-page',
                        {
                            subscriptionId: id
                        },
                        {
                            useRole: focusRole,
                            primary
                        }
                    )

                    return data
                } catch (error) {
                    console.error(error)
                }
            },
            close: () => {
                paymentSources.refetch()
            },
            success: () => {
                if (
                    // @ts-ignore
                    typeof window.rewardful === 'function' &&
                    chargebeeSubscription?.data?.customer?.email
                ) {
                    // @ts-ignore
                    window.rewardful('convert', {
                        email: chargebeeSubscription.data.customer.email
                    })
                }

                if (
                    // @ts-ignore
                    typeof window.tdconv === 'function'
                ) {
                    // @ts-ignore
                    window.tdconv('init', '2355966', { 'element': 'iframe' });
                    window.tdconv('track', 'sale', {
                        'transactionId': id,
                        'ordervalue': (chargebeeSubscription.data.subscription.plan_unit_price / 100) * chargebeeSubscription.data.subscription.plan_quantity,
                        'currency':'GBP', 
                        'event':437044
                    });
                }
            }
        })
    }
}


  const { convertGbp } = useCurrencyConversion(
    chargebeeSubscription.isSuccess
      ? (chargebeeSubscription.data.customer
          .preferred_currency_code as Currency)
      : 'GBP'
  )

  const userCount = subscription.data.user_count || 1

  if (
    !subscription.isFetching &&
    subscription.isSuccess &&
    subscription.data.type === SubscriptionType.Free
  ) {
    return (
      <Dashboard title="Billing">
        <h1 className="light">Billing</h1>
        <div className="row mt-2">
          <Feedback message="You are on a free subscription. No billing information is required." />
        </div>
      </Dashboard>
    )
  }

  return (
    <Dashboard title="Billing" loading={subscription.isFetching}>
      <h1 className="light">Billing</h1>
      <div className="row mt-2">
        <div className="col-12 col-lg-6 mt-2">
          <Card className="p-3 card--stretch">
            {chargebeeSubscription.isSuccess &&
              !chargebeeSubscription.data.subscription && (
                <div>
                  <Feedback
                    className="full-width mb-2"
                    message="Billing not yet activated. Please update your billing information and add a payment method."
                    type="error"
                  />
                </div>
              )}
            {chargebeeSubscription.isSuccess &&
              !chargebeeSubscription.isLoading && (
                <>
                  {chargebeeSubscription.data.subscription.next_billing_at && (
                    <div className="flex ai-c mt-1">
                      <p className="mb-0 mr-2">
                        <small>
                          Estimated monthly bill for period ending:{' '}
                          {format(
                            endOfMonth(
                              chargebeeSubscription.data.subscription
                                .next_billing_at * 1000
                            ),
                            'do MMMM, yyyy'
                          )}
                        </small>
                      </p>
                      <h2 className="h1 light mb-0 ml-a unbilled-amount">
                        {convertGbp(
                          (chargebeeSubscription.data.subscription
                            .plan_unit_price /
                            100) *
                            chargebeeSubscription.data.subscription
                              .plan_quantity
                        )}
                      </h2>
                    </div>
                  )}
                  <table className="static-table static-table--invoice">
                    <tbody>
                      <tr>
                        <td>Active users</td>
                        <td>{userCount}</td>
                        <td className="text-right">
                          {convertGbp(PER_UNIT_PRICE)}
                        </td>
                        <td className="text-right pr-1">
                          {convertGbp(PER_UNIT_PRICE * userCount)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <hr />
                </>
              )}
            <h3 className="h5 color-light-grey m-0">Latest invoices</h3>
            <div className="invoices mt-2">
              <TableContainer
                columns={[
                  { Header: 'Invoice', accessor: 'id' },
                  { Header: 'Status', accessor: 'status', Cell: paymentStatus },
                  {
                    Header: 'Amount',
                    accessor: 'amount_due',
                    Cell: toCurrency
                  },
                  {
                    Header: 'Due date',
                    accessor: 'due_date',
                    Cell: toDateCellFromUDate
                  },
                  { Header: ' ', Cell: Download }
                ]}
                hidePagination={true}
                fetch={() => {
                  if (invoices.isSuccess && !invoices.isStale) {
                    return Promise.resolve(invoices.data)
                  }
                  return Promise.resolve({
                    results: [],
                    page_total: 0,
                    total: 0
                  })
                }}
                fetchName={`billing_invoices_${fetchKey}_${invoices.isFetched}`}
              />
            </div>
          </Card>
        </div>
        <div className="col-12 col-lg-6 mt-2">
          <Card className="p-3 card--stretch">
            {subscription.isSuccess &&
              subscription.data.billing_plan_customer_id && (
                <>
                  <h2 className="h5 color-light-grey m-0">
                    Payment information
                  </h2>
                  {paymentSources.isSuccess &&
                  paymentSources.data.results.length === 0 ? (
                    <Feedback
                      type="error"
                      className="mt-2"
                      message="No payment method enabled. Please update your payment information."
                    />
                  ) : null}
                  {paymentSources.isSuccess
                    ? paymentSources.data.results.map((e) => (
                        <div className="row mt-2" key={e.id}>
                          {e.card && (
                            <>
                              <div className="col-2 text-center color-light-grey">
                                {e.card.brand === 'visa' && (
                                  <IconVisa width="32px" height="32px" />
                                )}
                                {e.card.brand === 'mastercard' && (
                                  <IconMasterCard width="32px" height="32px" />
                                )}
                              </div>
                              <div className="col">
                                <h4 className="light mb-0">
                                  {e.card.masked_number}
                                </h4>
                                <p>
                                  Expiry date: {e.card.expiry_month}/
                                  {e.card.expiry_year}
                                </p>
                              </div>
                            </>
                          )}
                          {/* <div className="col flex ai-c">
                        <div className="chip">Primary</div>
                        <div className="confirmed ml-1">
                          <IconCheck />
                        </div>
                      </div> */}
                        </div>
                      ))
                    : null}
                  <div className="mt-2">
                    <button
                      disabled={!paymentSources.isFetched}
                      className="button"
                      onClick={() =>
                        openChargebeeCheckout({ id: subscriptionId.current })
                      }>
                      Update payment information
                    </button>
                  </div>
                  <hr />
                </>
              )}
            <h3 className="h5 color-light-grey m-0">Billing information</h3>

            <table
              className={`static-table static-table--billing mt-2 billing-form`}>
              <tbody>
                <tr>
                  <th>Company / Entity</th>
                  <td>{subscription.data.billing_entity || '-'}</td>
                </tr>
                <tr>
                  <th>First name</th>
                  <td>{subscription.data.billing_first_name || '-'}</td>
                </tr>
                <tr>
                  <th>Last name</th>
                  <td>{subscription.data.billing_last_name || '-'}</td>
                </tr>
                <tr>
                  <th>Email</th>
                  <td>{subscription.data.billing_email || '-'}</td>
                </tr>
                <tr>
                  <th>Address line 1</th>
                  <td>{subscription.data.billing_address_1 || '-'}</td>
                </tr>
                <tr>
                  <th>Address line 2</th>
                  <td>{subscription.data.billing_address_2 || '-'}</td>
                </tr>
                <tr>
                  <th>City</th>
                  <td>{subscription.data.billing_city || '-'}</td>
                </tr>
                <tr>
                  <th>State / Province</th>
                  <td>{subscription.data.billing_state || '-'}</td>
                </tr>
                <tr>
                  <th>Zip / Postal code</th>
                  <td>{subscription.data.billing_postcode || '-'}</td>
                </tr>
                <tr>
                  <th>Country</th>
                  <td>{subscription.data.billing_country || '-'}</td>
                </tr>
                <tr>
                  <th>Currency</th>
                  <td>{subscription.data.billing_currency_code || '-'}</td>
                </tr>
              </tbody>
            </table>

            <div className="mt-2">
              <button
                className="button"
                onClick={EditBilling}
                disabled={subscription.isLoading}>
                Update billing information
              </button>
            </div>

            <div className="flex jc-e">
              <small className="color-light-grey">
                {subscription.data.billing_plan_customer_id || '-'} /{' '}
                {subscription.data.billing_plan_subscription_id || '-'}
              </small>
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

export const paymentStatus = ({ value }) => {
  const status = {
    paid: 'Paid',
    payment_due: 'Payment Due'
  }
  return (
    <div className={`chip ${value === 'paid' ? 'chip-primary' : ''}`}>
      {status[value] || '-'}
    </div>
  )
}

export const paymentAmount = ({ value }) => {
  return (
    <div className={`chip ${value === 'paid' ? 'chip-primary' : ''}`}>
      {status[value] || '-'}
    </div>
  )
}
