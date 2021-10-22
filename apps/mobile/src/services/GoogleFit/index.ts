import {PermissionsAndroid} from 'react-native';
import GoogleFit, {Scopes} from 'react-native-google-fit';
import {mapping} from './constants';
import {getTodayTimeframe} from '../utils';
import {
  WebhookEventActivity,
  WebhookEventData,
} from '@fitlink/api/src/modules/providers/types/webhook';
import {syncDeviceActivities} from 'services/common';
import {queryClient, QueryKeys} from '@query';
import {ProviderType} from '@fitlink/api/src/modules/providers/providers.constants';

const ACTIVITY_RECOGNITION_PERMISSION =
  'android.permission.ACTIVITY_RECOGNITION' as any;

type StepData = {
  steps: number;
  hour: number;
};

type WaterData = {
  amount: number;
  hour: number;
};

async function getTodaysSteps(): Promise<number> {
  let stepsTotal = 0;

  try {
    const timeframe = getTodayTimeframe();

    // Request samples from Google Fit
    const googleFitData = await GoogleFit.getDailyStepCountSamples({
      ...timeframe,
      bucketUnit: 'HOUR',
      bucketInterval: 1,
    });

    // Get data source with most entries logged
    const dataSourceWithMostSteps = googleFitData.sort(
      (a, b) => b.rawSteps.length - a.rawSteps.length,
    )[0];

    // Map results to each hour of the day
    const dataMappedByHour: {[hour: number]: number} = {};

    for (const rawStep of dataSourceWithMostSteps.rawSteps) {
      const hourOfDay = new Date(rawStep.startDate).getHours();
      dataMappedByHour[hourOfDay] =
        (dataMappedByHour[hourOfDay] || 0) + rawStep.steps;
    }

    // Convert "dataMappedByHour" to type StepData[]
    const results = Object.values(dataMappedByHour).map((steps, index) => {
      const hour = parseInt(Object.keys(dataMappedByHour)[index]);
      return {
        hour,
        steps,
      } as StepData;
    });

    stepsTotal = results.reduce((acc, val) => acc + val.steps, 0);
  } catch (e) {
    console.log('Unable to retrieve steps data: ' + e);
  }

  return stepsTotal;
}

async function getTodayHydration() {
  let totalLitres = 0;

  try {
    const timeframe = getTodayTimeframe();

    // Request samples from Google Fit
    const googleFitData = await GoogleFit.getHydrationSamples(timeframe);

    // Convert "googleFitData" to type WaterData[]
    const results = googleFitData.map(entry => {
      const date = new Date(entry.date);
      const hour = date.getHours();

      return {
        hour,
        amount: parseFloat(entry.waterConsumed + ''), // Type definition is incorrect, casting to string
      } as WaterData;
    });

    totalLitres = results.reduce((acc, val) => acc + val.amount, 0);
  } catch (e) {
    console.log('Unable to retrieve hydration data: ' + e);
  }

  return totalLitres;
}

/**
 * Get all activities from a given date.
 * @param date ISO8601 string. Make sure you offset server date to client date.
 * @param interval GoogleFit will silently freeze if the range is too big with a small bucketInterval (ie. more than 30 days)
 */
async function getActivitiesSinceDate(date: string, interval: number) {
  const from = new Date(date);
  const to = new Date();

  const all: any = [];

  // loop for every day
  for (let day = from; day <= to; day.setDate(day.getDate() + interval)) {
    const xDaysFromNow = new Date(day);
    xDaysFromNow.setDate(xDaysFromNow.getDate() + interval);

    const activities = await GoogleFit.getActivitySamples({
      startDate: day.toISOString(),
      endDate: xDaysFromNow.toISOString(),
      bucketUnit: 'SECOND',
      bucketInterval: 1,
    });

    // filter types with "unknown" and "still" activity type, and make sure they are fitness activities
    const activitiesFiltered = activities.filter(
      x =>
        x.activityName !== 'unknown' &&
        x.activityName !== 'still' &&
        (x.sourceId === 'com.google.android.apps.fitness' ||
          'com.google.android.gms') &&
        x.tracked === false,
    );

    all.push(...activitiesFiltered);
  }

  return all;
}

async function checkIsAuthorized() {
  await GoogleFit.checkIsAuthorized();
  return GoogleFit.isAuthorized;
}

async function checkIsAvailable() {
  return await new Promise((resolve, reject) => {
    GoogleFit.isAvailable((isError, result) => {
      if (isError) reject(result);
      resolve(result);
    });
  });
}

async function authenticate() {
  const authResult = await GoogleFit.authorize({
    scopes: [
      Scopes.FITNESS_ACTIVITY_READ,
      Scopes.FITNESS_NUTRITION_READ,
      Scopes.FITNESS_SLEEP_READ,
      Scopes.FITNESS_LOCATION_READ,
    ],
  });

  const hasActivityRecognitionPermission = await PermissionsAndroid.check(
    ACTIVITY_RECOGNITION_PERMISSION,
  );

  if (!hasActivityRecognitionPermission) {
    await PermissionsAndroid.request(ACTIVITY_RECOGNITION_PERMISSION);
  }

  if (!authResult.success) throw Error(authResult.message);
}

function disconnect() {
  GoogleFit.disconnect();
}

async function getTodaysSleepHours() {
  let sleepTotal = 0;

  try {
    const timeframe = getTodayTimeframe();

    // Offset the starting time by -24 hours from the starting of today
    const startDate = new Date(
      new Date(timeframe.startDate).valueOf() - 24 * 60 * 60 * 1000,
    ).toISOString();

    const sleepData = await GoogleFit.getSleepSamples({
      startDate: startDate,
      endDate: timeframe.endDate,
    });

    // We get every session between yesterday 8PM - today
    const sleepHours = sleepData.map(x => {
      const startDate = new Date(x.startDate);
      const endDate = new Date(x.endDate);

      // If this sleep session ended yesterday, we don't count it in today's stat
      if (endDate < new Date(timeframe.startDate)) {
        return 0;
      }

      const sleepDurationHour =
        (endDate.getTime() - startDate.getTime()) / (60 * 60 * 1000);

      return sleepDurationHour;
    });

    sleepTotal = sleepHours.reduce((acc, val) => acc + val, 0);
  } catch (e) {
    console.log('Unable to retrieve sleep data: ' + e);
  }

  return sleepTotal;
}

async function getTodayMindfulnessMinutes() {
  let mindfulnessMinutesTotal = 0;

  try {
    const timeframe = getTodayTimeframe();

    const activities = await GoogleFit.getActivitySamples({
      ...timeframe,
      bucketUnit: 'SECOND',
      bucketInterval: 1,
    });

    // filter types with "unknown" and "still" activity type, and make sure they are fitness activities
    const activitiesFiltered = activities.filter(
      x => x.activityName === 'meditation',
    );

    const activitiesMapped = activitiesFiltered.map(x => {
      const startDate = new Date(x.start);
      const endDate = new Date(x.end);

      const mindfulnessDurationMinutes =
        (endDate.getTime() - startDate.getTime()) / (60 * 1000);

      return mindfulnessDurationMinutes;
    });

    mindfulnessMinutesTotal = activitiesMapped.reduce(
      (acc, val) => acc + val,
      0,
    );
  } catch (e) {
    console.log('Unable to retrieve mindfulness data: ' + e);
  }

  return mindfulnessMinutesTotal;
}

function mapToFitlinkActivity(activityName: string) {
  return mapping[activityName] || 'unknown';
}

function normalizeActivities(activities: any[]): WebhookEventData {
  const normalizedActivities = activities.map((x: any) => {
    return {
      type: mapToFitlinkActivity(x.activityName),
      provider: 'google_fit',
      start_time: new Date(x.start).toISOString(),
      end_time: new Date(x.end).toISOString(),
      calories: x.calories,
      distance: x.distance,
      quantity: x.quantity,
    } as WebhookEventActivity;
  });

  return {activities: normalizedActivities};
}

async function syncActivities() {
  try {
    // Get date 1 month ago
    var date = new Date();
    date.setMonth(date.getMonth() - 1);
    date.setHours(0, 0, 0);
    date.setMilliseconds(0);

    const activities = await getActivitiesSinceDate(date.toISOString(), 5);

    if (activities.length === 0) {
      console.log(
        "No new activities since last submitted activity's end date.",
      );
      return;
    }

    const normalizedActivities = normalizeActivities(activities);

    await syncDeviceActivities(normalizedActivities);
  } catch (e: any) {
    console.warn('Unable to sync Google Fit data with backend: ' + e.message);
  }
}

async function syncLifestyle() {
  const steps = await getTodaysSteps();
  const sleep_hours = await getTodaysSleepHours();
  const water_litres = await getTodayHydration();
  const mindfulness = await getTodayMindfulnessMinutes();

  return {
    sleep_hours,
    steps,
    water_litres,
    mindfulness,
    floors_climbed: 0,
  };
}

/**
 * Synchronize Google Fit data with backend.
 */
async function syncAllWithBackend() {
  // Check if Google Fit is linked to the user
  try {
    const providers = queryClient.getQueryData(QueryKeys.MyProviders) as [];
    if (
      providers &&
      providers.length &&
      providers.find(provider => provider.type === ProviderType.GoogleFit)
    ) {
      // Make sure Google Fit is installed
      const isAvailable = await checkIsAvailable();
      if (!isAvailable) return;

      // Make sure Google Fit singleton is instantiated
      const isAuthorized = await checkIsAuthorized();
      if (!isAuthorized) await authenticate();

      await Promise.all([syncActivities(), syncLifestyle()]);
    }
  } catch (e) {
    console.warn('Unable to sync Google Fit data with backend: ' + e);
  }
}

export const GoogleFitWrapper = {
  syncAllWithBackend,
  disconnect,
  authenticate,
};
