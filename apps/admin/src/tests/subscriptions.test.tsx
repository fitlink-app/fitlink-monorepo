import React from 'react'
import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved
} from '@testing-library/react'
import * as moxios from 'moxios'
import Page from '../pages/subscriptions'
import App from './mock/app'
import { api } from '../context/Auth.context'
import { act } from 'react-dom/test-utils'
import Toast from 'react-hot-toast'
import { mockSessionState } from './mock/session'

const useRouter = jest.spyOn(require('next/router'), 'useRouter')

useRouter.mockImplementation(() => ({
  push: jest.fn(),
  prefetch: jest.fn(() => Promise.resolve()),
  pathname: 'testing',
  query: {},
  isReady: true
}))

const toast = jest.spyOn(require('react-hot-toast'), 'default')

toast.mockImplementation(() => ({
  promise: jest.fn(() => Promise.resolve())
}))

describe('Subscriptions', () => {
  const axios = api.getAxiosInstance()

  beforeAll(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(), // Deprecated
        removeListener: jest.fn(), // Deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn()
      }))
    })
  })

  beforeEach(() => {
    moxios.install(axios)
  })

  afterEach(() => {
    moxios.uninstall(axios)
  })

  it('Fetches and displays subscription data in table', async () => {
    mockSessionState()

    moxios.stubRequest(/subscriptions.*/, {
      status: 200,
      response: {
        results: [
          {
            created_at: '2021-07-23T12:13:56.134Z',
            updated_at: '2021-08-04T05:42:09.698Z',
            id: 'da17c5c9-1f76-4848-b85a-7c9050439286',
            billing_first_name: 'Paul',
            billing_last_name: 'Gosnell',
            billing_entity: 'Fitness Tech Group Ltd 2',
            billing_address_1: '20-22 Wenlock Road',
            billing_address_2: '',
            billing_country: 'GB',
            billing_country_code: 'GB',
            billing_state: 'London',
            billing_city: 'London',
            billing_postcode: 'N1 7GU',
            billing_currency_code: 'GBP',
            billing_plan_customer_id: '169mC8SQyKJ6JWay',
            billing_plan_status: 'canceled',
            billing_plan_trial_end_date: '2021-04-30T23:59:59.999Z',
            billing_plan_last_billed_month: '06-2021',
            type: 'dynamic',
            default: true,
            subscription_starts_at: '2021-04-30T23:59:59.999Z',
            organisation: {
              created_at: '2021-07-23T12:13:56.134Z',
              updated_at: '2021-08-05T06:43:01.358Z',
              id: 'cb6eeb13-f5d1-402c-ab7b-55596e38b5c3',
              name: 'Fitlink',
              type: 'company',
              type_other: 'Tester',
              timezone: 'Europe/London',
              user_count: 0
            }
          }
        ],
        page_total: 2,
        total: 2
      }
    })

    render(
      <App>
        <Page />
      </App>
    )

    const items = await screen.findAllByText(
      /Fitness Tech Group|dynamic|Fitlink|Gosnell/
    )
    expect(items).toHaveLength(4)

    // Show and test the edit modal
    screen.getByRole('button', { name: /make default/i }).click()
    expect(screen.getAllByText(/set default subscription/i)).toHaveLength(1)

    const confirmBtn = screen.getAllByRole('button', { name: /confirm/i })
    expect(confirmBtn).toHaveLength(1)

    moxios.stubRequest(/subscriptions.*/, {
      status: 200,
      response: {}
    })

    confirmBtn[0].click()

    // Expect the element to be removed from screen
    // await waitForElementToBeRemoved(screen.queryByText(/set default subscription/i))
  })
})
