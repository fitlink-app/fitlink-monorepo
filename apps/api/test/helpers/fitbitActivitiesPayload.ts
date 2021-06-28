export default {
  activities: [
    {
      activeDuration: 1001000,
      activityLevel: [
        {
          minutes: 0,
          name: 'sedentary'
        },
        {
          minutes: 0,
          name: 'lightly'
        },
        {
          minutes: 17,
          name: 'fairly'
        },
        {
          minutes: 0,
          name: 'very'
        }
      ],
      activityName: 'Bike',
      activityTypeId: 90001,
      averageHeartRate: 93,
      calories: 77,
      caloriesLink:
        'https://api.fitbit.com/1/user/-/activities/calories/date/2016-03-28/2016-03-28/1min/time/19:05/19:22.json',
      distance: 4.1978,
      distanceUnit: 'Kilometer',
      duration: 1001000,
      heartRateLink:
        'https://api.fitbit.com/1/user/-/activities/heart/date/2016-03-28/2016-03-28/1sec/time/19:05:31/19:22:12.json',
      heartRateZones: [
        {
          max: 94,
          min: 30,
          minutes: 7,
          name: 'Out of Range'
        },
        {
          max: 131,
          min: 94,
          minutes: 10,
          name: 'Fat Burn'
        },
        {
          max: 159,
          min: 131,
          minutes: 0,
          name: 'Cardio'
        },
        {
          max: 220,
          min: 159,
          minutes: 0,
          name: 'Peak'
        }
      ],
      lastModified: '2016-03-29T03:03:12.000Z',
      logId: 2068007929,
      logType: 'manual',
      manualValuesSpecified: {
        calories: true,
        distance: true,
        steps: true
      },
      source: {
        id: '22997K',
        name: 'Fitbit + Strava',
        type: 'app',
        url: 'https://strava.fitbit.com/'
      },
      speed: 15.096983016983017,
      startTime: '2016-03-28T19:05:31.000-07:00',
      steps: 0
    },
    {
      activeDuration: 1503000,
      activityLevel: [
        {
          minutes: 4,
          name: 'sedentary'
        },
        {
          minutes: 11,
          name: 'lightly'
        },
        {
          minutes: 3,
          name: 'fairly'
        },
        {
          minutes: 7,
          name: 'very'
        }
      ],
      activityName: 'Walk',
      activityTypeId: 90013,
      averageHeartRate: 96,
      calories: 134,
      caloriesLink:
        'https://api.fitbit.com/1/user/-/activities/calories/date/2016-03-26/2016-03-26/1min/time/14:49/15:14.json',
      duration: 1503000,
      heartRateLink:
        'https://api.fitbit.com/1/user/-/activities/heart/date/2016-03-26/2016-03-26/1sec/time/14:49:05/15:14:08.json',
      heartRateZones: [
        {
          max: 94,
          min: 30,
          minutes: 8,
          name: 'Out of Range'
        },
        {
          max: 131,
          min: 94,
          minutes: 17,
          name: 'Fat Burn'
        },
        {
          max: 159,
          min: 131,
          minutes: 0,
          name: 'Cardio'
        },
        {
          max: 220,
          min: 159,
          minutes: 0,
          name: 'Peak'
        }
      ],
      lastModified: '2016-03-26T22:34:17.000Z',
      logId: 2047712815,
      logType: 'auto_detected',
      manualValuesSpecified: {
        calories: false,
        distance: false,
        steps: false
      },
      startTime: '2016-03-26T14:49:05.000-07:00',
      steps: 1662
    }
  ]
}
