const axios = require('axios');
const FormData = require('form-data');

function deleteStravaSubscription({
  client_id,
  client_secret,
  subscription_id
}) {
  let data = new FormData();
  data.append('client_id', client_id);
  data.append('client_secret', client_secret);
  const config = {
    method: 'delete',
    url: `https://www.strava.com/api/v3/push_subscriptions/${subscription_id}`,
    headers: {
      ...data.getHeaders()
    },
    data: data
  };
  const res = await axios(config);

  return res.data;
}
