const axios = require('axios');
const FormData = require('form-data');
const { strava_verify_token, strava_push_subscription } = require("./webhook-subscriptions");

function createStravaSubscription({
  client_id,
  client_secret,
  callback_url
}) {
  const data = new FormData();

  data.append('client_id', client_id);
  data.append('client_secret', client_secret);
  data.append('callback_url', callback_url);
  data.append('verify_token', strava_verify_token);

  const config = {
    method: 'post',
    url: strava_push_subscription,
    headers: { ...data.getHeaders() },
    data: data
  };
  const res = await axios(config);
  return res.data;
}
