import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import * as moxios from 'moxios'
import Page from '../pages/users'
import App from './mock/app'
import { api } from '../context/Auth.context'

const useRouter = jest.spyOn(require('next/router'), 'useRouter')

useRouter.mockImplementation(() => ({
  push: jest.fn(),
  prefetch: jest.fn(() => Promise.resolve()),
  pathname: 'testing'
}))

describe('Users', () => {
  const axios = api.getAxiosInstance()

  beforeEach(() => {
    moxios.install(axios)
  })

  afterEach(() => {
    moxios.uninstall(axios)
  })

  it('Fetches and displays users data in table', async () => {
    moxios.stubRequest('/me', {
      status: 200,
      response: {
        email: 'johndoe@example.com'
      }
    })

    moxios.stubRequest('/me/roles', {
      status: 200,
      response: [
        {
          role: 'super_admin'
        }
      ]
    })

    moxios.stubRequest(/users.*/, {
      status: 200,
      response: {
        results: [
          {
            created_at: '2021-07-23T07:13:56.134Z',
            updated_at: '2021-07-23T07:13:56.134Z',
            id: '011a0c23-c837-4115-a1eb-2bf4d0d47ac8',
            last_login_at: '1969-12-31T19:00:00.000Z',
            name: 'Jodie ',
            email: '8mzFJNaZajNTQUcZd45I5zXFFl72-sanitized@fitlinkapp.com'
          }
        ],
        page_total: 1,
        total: 1
      }
    })

    global.localStorage.setItem('access_token', 'test')
    global.localStorage.setItem('refresh_token', 'test')
    global.localStorage.setItem('id_token', 'test')

    render(
      <App
        authContext={{
          focusRole: 'app'
        }}>
        <Page />
      </App>
    )

    const items = await screen.findAllByText(
      /Jodie|1969\-12\-31|2021\-07\-23|8mzFJNaZajNTQUcZd45I5zXFFl72\-sanitized\@fitlinkapp\.com/
    )
    expect(items).toHaveLength(5)
    expect(
      screen.getAllByPlaceholderText(/Enter name or email\.\.\./)
    ).toHaveLength(1)
    // Show and test the edit modal
    screen.getByRole('button', { name: /edit/i }).click()
    expect(screen.getAllByText(/save user/i)).toHaveLength(1)
    expect(
      screen.getAllByText(/generate a password reset email/i)
    ).toHaveLength(1)
    const modalItems = screen.getAllByDisplayValue(
      /Jodie|8mzFJNaZajNTQUcZd45I5zXFFl72\-sanitized\@fitlinkapp\.com/
    )
    expect(modalItems).toHaveLength(2)
  })
})
