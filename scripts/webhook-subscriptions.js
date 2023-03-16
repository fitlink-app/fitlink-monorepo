const { viewStravaSubscription } = require('./viewStravaSubscription')
const strava_verify_token = 'daVerifyTokenIsAMyth'
exports.strava_verify_token = strava_verify_token
const STRAVA_CLIENT_ID = '53337'
const STRAVA_CLIENT_SECRET = '90c42d9c995730d7225f5c375d71c8fdc985bc91'
const WEBHOOK_URL = ''

const strava_push_subscription =
  'https://www.strava.com/api/v3/push_subscriptions'
exports.strava_push_subscription = strava_push_subscription(async () => {
  const stravaSubscriptionStatus = await viewStravaSubscription({
    client_id: STRAVA_CLIENT_ID,
    client_secret: STRAVA_CLIENT_SECRET
  })
  console.log(stravaSubscriptionStatus)
})()



const BFIT_STRAVA_CLIENT_ID = '59872'
const BFIT_STRAVA_CLIENT_SECRET = '657513b1852f65d2d5dac18ca08d77780e1cd5af'
const BFIT_WEBHOOK_URL = ''

const bfit_strava_push_subscription =
  'https://www.strava.com/api/v3/push_subscriptions'
exports.strava_push_subscription = strava_push_subscription(async () => {
  const stravaSubscriptionStatus = await viewStravaSubscription({
    client_id: BFIT_STRAVA_CLIENT_ID,
    client_secret: BFIT_STRAVA_CLIENT_SECRET
  })
  console.log(stravaSubscriptionStatus)
})()