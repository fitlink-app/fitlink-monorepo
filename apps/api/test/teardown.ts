import { rm } from 'fs/promises'

export default async () => {
  try {
    console.log('Cleaning up test emails')
    await rm('email-debug.log')
  } catch (e) {}
}
