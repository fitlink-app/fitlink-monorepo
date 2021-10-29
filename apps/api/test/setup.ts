// Mock the Firebase admin
jest.mock('firebase-admin', () => {
  return {
    credential: {
      cert: (opt) => opt
    },
    initializeApp: (opt) => opt
  }
})

export default async () => {}
