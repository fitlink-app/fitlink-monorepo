import { zonedStartOfDay, zonedEndOfDay } from './helpers'

const timezones = [
  'Africa/Johannesburg',
  'Europe/Lisbon',
  'Europe/London',
  'America/New_York',
  'Etc/UTC',
  'BrokenTimezoneIsUTC'
]

timezones.map((t) => {
  console.log(
    `${zonedStartOfDay(t).toISOString()} | ${zonedStartOfDay(t)} | ${t}`
  )
})

console.log('==')

timezones.map((t) => {
  console.log(`${zonedEndOfDay(t).toISOString()} | ${zonedEndOfDay(t)} | ${t}`)
})
