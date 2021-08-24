import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import * as moxios from 'moxios'
import Page from '../pages/organisations'
import App from './mock/app'
import { api } from '../context/Auth.context'

const useRouter = jest.spyOn(require('next/router'), 'useRouter')

useRouter.mockImplementation(() => ({
  push: jest.fn(),
  prefetch: jest.fn(() => Promise.resolve()),
  pathname: 'testing'
}))

describe('Organisations', () => {
  const axios = api.getAxiosInstance()

  beforeEach(() => {
    moxios.install(axios)
  })

  afterEach(() => {
    moxios.uninstall(axios)
  })

  it('Fetches and displays org data in table', async () => {
    moxios.stubRequest(/organisations.*/, {
      status: 200,
      response: {
        results: [
          {
            created_at: '2021-07-23T12:13:56.134Z',
            updated_at: '2021-07-23T12:13:56.134Z',
            id: 'cb6eeb13-f5d1-402c-ab7b-55596e38b5c3',
            name: 'Fitlink',
            timezone: 'Europe/London',
            type: 'company',
            type_other: null,
            user_count: 99
          }
        ],
        total: 1,
        page_total: 1
      }
    })

    render(
      <App>
        <Page />
      </App>
    )

    const items = await screen.findAllByText(/Fitlink|company|2021\-07\-23|99/)
    expect(items).toHaveLength(5)
    expect(screen.getAllByPlaceholderText(/Enter name\.\.\./)).toHaveLength(1);
    // Show and test the edit modal
    screen.getByRole('button', { name: /edit/i }).click()
    expect(screen.getAllByText(/save organisation/i)).toHaveLength(1)
    const modalItems = screen.getAllByDisplayValue(/Europe\/London/)
    expect(modalItems).toHaveLength(1)
  })
})
