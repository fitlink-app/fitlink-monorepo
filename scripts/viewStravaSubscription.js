const axios = require('axios');
const { strava_push_subscription } = require("./webhook-subscriptions");

function viewStravaSubscription({ client_id, client_secret }) {
  const res = await axios.get(
    `${strava_push_subscription}?client_id=${client_id}&client_secret=${client_secret}`
  );
  return res.data;
}
exports.viewStravaSubscription = viewStravaSubscription;
