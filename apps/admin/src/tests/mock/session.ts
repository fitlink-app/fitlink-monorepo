import * as moxios from 'moxios'

export const mockSessionState = () => {
  moxios.stubRequest('/me', {
    status: 200,
    response: {
      email: 'johndoe@example.com',
      name: 'John Doe'
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

  moxios.stubRequest('/me/role', {
    status: 200,
    response: {
      organisation_admin: [],
      subscription_admin: [],
      super_admin: true,
      team_admin: []
    }
  })
}
