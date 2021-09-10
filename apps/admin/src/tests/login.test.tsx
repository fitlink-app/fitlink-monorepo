import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import * as moxios from 'moxios'
import Page from '../pages/login'
import App from './mock/app'
import { api } from '../context/Auth.context'

const useRouter = jest.spyOn(require('next/router'), 'useRouter')

const mockJwt = `eyJhbGciOiJIUzI1NiJ9.eyJuYW1lIjoiSm9obiBEb2UifQ.K1lVDxQYcBTPnWMTGeUa3gYAgdEhMFFv38VmOyl95bA`

describe('Login', () => {
  const axios = api.getAxiosInstance()

  beforeEach(() => {
    moxios.install(axios)
    console.error = jest.fn()

    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID = 'jest'
    process.env.NEXT_PUBLIC_APPLE_CLIENT_ID = 'jest'
  })

  afterEach(() => {
    moxios.uninstall(axios)
  })

  it('Displays an error message when attempting to login with wrong details', async () => {
    moxios.stubRequest('/auth/login', {
      status: 403,
      response: {
        message: 'Invalid email or password'
      }
    })

    render(
      <App>
        <Page />
      </App>
    )

    screen
      .getByRole('button', {
        name: /Login with e-mail/i
      })
      .click()

    const items = await screen.findAllByText(/Invalid/)

    expect(items).toHaveLength(1)
    expect(console.error).toHaveBeenCalled()
  })

  it('Displays success when logging in with correct details', async () => {
    moxios.stubRequest('/auth/login', {
      status: 200,
      response: {
        access_token: mockJwt,
        id_token: 'id_token',
        refresh_token: 'refresh_token'
      }
    })

    moxios.stubRequest('/me', {
      status: 200,
      response: {
        email: 'johndoe@example.com'
      }
    })

    moxios.stubRequest('/me/roles', {
      status: 200,
      response: []
    })

    const push = jest.fn()
    useRouter.mockImplementation(() => ({
      push,
      prefetch: jest.fn(() => Promise.resolve()),
      isReady: true,
      query: {}
    }))

    render(
      <App>
        <Page />
      </App>
    )

    screen
      .getByRole('button', {
        name: /Login with e-mail/i
      })
      .click()

    await waitFor(() => expect(push).toHaveBeenCalledWith('/start'))
    expect(console.error).not.toHaveBeenCalled()
  })
})
