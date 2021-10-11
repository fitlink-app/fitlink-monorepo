import AppleHealthKit, {
  HealthKitPermissions,
  HealthInputOptions,
} from 'react-native-health';
import {getTodayTimeframe} from 'services/utils';
import {mapping} from './constants';
import {
  WebhookEventActivity,
  WebhookEventData,
} from '@fitlink/api/src/modules/providers/types/webhook';
import {syncDeviceActivities} from 'services/common';

export type HealthKitActivity = {
  device: string;
  end: string;
  start: string;
  distance: number;
  activityId: number;
  calories: number;
  tracked: boolean;
  activityName: string;
  sourceName: string;
  sourceId: string;
};

const permissions = {
  permissions: {
    read: [
      AppleHealthKit.Constants.Permissions.HeartRate,
      AppleHealthKit.Constants.Permissions.Workout,
      AppleHealthKit.Constants.Permissions.Steps,
      AppleHealthKit.Constants.Permissions.MindfulSession,
      AppleHealthKit.Constants.Permissions.FlightsClimbed,
      AppleHealthKit.Constants.Permissions.SleepAnalysis,
      AppleHealthKit.Constants.Permissions.Water,
    ],
  },
} as HealthKitPermissions;

async function authenticate(): Promise<void> {
  return new Promise((resolve, reject) => {
    AppleHealthKit.initHealthKit(permissions, (error: string) => {
      if (error) reject('Cannot grant permissions!');
      resolve();
    });
  });
}

async function getTodaysSteps() {
  let stepsTotal = 0;
  try {
    let date = getTodayTimeframe().startDate;
    let options = {
      startDate: date,
      unit: AppleHealthKit.Constants.Units.count,
    };
    const stepSamples: any[] = await new Promise((resolve, reject) => {
      AppleHealthKit.getDailyStepCountSamples(options, (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });
    stepsTotal = stepSamples.reduce(
      (acc: number, val: {value: number}) => acc + val.value,
      0,
    );
  } catch (e) {
    console.log(e);
  }
  return stepsTotal;
}

function calculateSleepDuration(samples: any[]) {
  if (!samples.length) return 0;

  const samplesFiltered = samples.filter(x => x.value === 'ASLEEP');

  const samplesMapped = samplesFiltered.map(sample => ({
    start: new Date(sample.startDate).valueOf(),
    end: new Date(sample.endDate).valueOf(),
  }));

  const samplesSorted = [...samplesMapped].sort((a, b) => a.start - b.start);

  let total = 0;
  let start = samplesSorted[0].start;
  let end = samplesSorted[0].end;

  for (const sample of samplesSorted) {
    if (sample.start > end) {
      total += end - start;
      start = sample.start;
      end = sample.end;
    } else if (sample.end > end) {
      end = sample.end;
    }
  }

  total += end - start;
  return total / 1000 / 60 / 60;
}

async function getTodaysSleepHours() {
  try {
    let date = new Date(getTodayTimeframe().startDate);

    // Offset the starting time by -24 hours from the starting of today
    const startDate = new Date(date.valueOf() - 24 * 60 * 60 * 1000);

    let options = {
      startDate: startDate.toISOString(),
      unit: AppleHealthKit.Constants.Units.minute,
    };

    const sleepSamples: any[] = await new Promise((resolve, reject) => {
      AppleHealthKit.getSleepSamples(options, (err, results) => {
        if (err) reject(err);
        resolve(results as any);
      });
    });

    // Start date can't be higher than minStartDate (yesterday 6pm)
    const minStartDate = new Date(startDate);
    minStartDate.setHours(18, 0, 0);

    const adjustedSleepSamples = sleepSamples.map(x => {
      const sampleStartDate = new Date(x.startDate);
      if (sampleStartDate < minStartDate) {
        return {...x, startDate: minStartDate.toISOString()};
      }
      return x;
    });

    // Filter out incorrect samples after adjustment
    const filteredSamples = adjustedSleepSamples.filter(
      x => new Date(x.startDate) < new Date(x.endDate),
    );

    return calculateSleepDuration(filteredSamples);
  } catch (e) {
    console.log(e);
  }
  return 0;
}

async function getTodayHydration() {
  let litresTotal = 0;
  try {
    let date = getTodayTimeframe().startDate;

    let options = {
      startDate: date,
    };

    const waterToday: {value: number} = await new Promise((resolve, reject) => {
      AppleHealthKit.getWater(options, (err, results) => {
        if (err) reject(err);
        resolve(results as any);
      });
    });

    litresTotal = waterToday?.value || 0;
  } catch (e) {
    console.log(e);
  }
  return litresTotal;
}

async function getTodayMindfulnessMinutes() {
  let mindfulnessMinutesTotal = 0;

  try {
    let timeFrame = getTodayTimeframe();
    let options = {...timeFrame, unit: AppleHealthKit.Constants.Units.minute};

    const mindfulSessions: {
      value: number;
      startDate: string;
      endDate: string;
    }[] = await new Promise((resolve, reject) => {
      AppleHealthKit.getMindfulSession(options, (err, results) => {
        if (err) reject(err);
        resolve(results as any);
      });
    });

    const mindfulSessionDurations = mindfulSessions.map(x => {
      const startDate = new Date(x.startDate);
      const endDate = new Date(x.endDate);

      const mindfulnessDurationMinutes =
        (endDate.getTime() - startDate.getTime()) / (60 * 1000);
      return mindfulnessDurationMinutes;
    });

    mindfulnessMinutesTotal = mindfulSessionDurations.reduce(
      (acc, val) => acc + val,
      0,
    );
  } catch (e) {
    console.log(e);
  }
  return mindfulnessMinutesTotal;
}

async function getTodayFloorsClimbed() {
  let flightsClimbedCount = 0;

  try {
    let options = {
      date: new Date().toISOString(),
      unit: AppleHealthKit.Constants.Units.count,
    };

    const flightsClimbed: {value: number} = await new Promise(
      (resolve, reject) => {
        AppleHealthKit.getFlightsClimbed(options, (err, results) => {
          if (err) reject(err);
          resolve(results as any);
        });
      },
    );

    flightsClimbedCount = flightsClimbed.value;
  } catch (e) {
    console.log(e);
  }
  return flightsClimbedCount;
}

/**
 * Get all activities from a given date.
 * @param date ISO8601 string. Make sure you offset server date to client date.
 */
async function getActivitiesSinceDate(
  startDate: string,
): Promise<HealthKitActivity[]> {
  const endDate = new Date().toISOString();

  let options = {
    startDate,
    endDate,
    type: AppleHealthKit.Constants.Observers.Workout,
    unit: AppleHealthKit.Constants.Units.meter,
  } as HealthInputOptions;

  return new Promise((resolve, reject) => {
    AppleHealthKit.getSamples(options, (err: Object, results: any) => {
      if (err) {
        reject('Unable to retrieve activities from HealthKit.');
      }

      resolve(results);
    });
  });
}

function mapToFitlinkActivity(activityName: string) {
  return mapping[activityName] || 'unknown';
}

function normalizeActivities(activities: any[]): WebhookEventData {
  const normalizedActivities = activities.map((x: any) => {
    return {
      type: mapToFitlinkActivity(x.activityName),
      provider: 'apple_healthkit',
      start_time: new Date(x.start).toISOString(),
      end_time: new Date(x.end).toISOString(),
      calories: x.calories,
      distance: x.distance * 1.609344 * 1000,
      quantity: x.quantity,
    } as WebhookEventActivity;
  });

  return {activities: normalizedActivities};
}

async function getTodayLifestyleData() {
  const steps = await getTodaysSteps();
  const sleep_hours = await getTodaysSleepHours();
  const water_litres = await getTodayHydration();
  const mindfulness = await getTodayMindfulnessMinutes();
  const floors_climbed = await getTodayFloorsClimbed();

  return {
    steps,
    sleep_hours,
    water_litres,
    mindfulness,
    floors_climbed,
  };
}

async function syncLifestyle() {
  const data = await getTodayLifestyleData();
  // TODO:
  // await syncDeviceLifestyleData()
}

async function syncActivities() {
  // Get date 1 month ago
  var date = new Date();

  date.setMonth(date.getMonth() - 1);
  date.setHours(0, 0, 0);
  date.setMilliseconds(0);

  const startDate = date.toISOString();

  const activities = await getActivitiesSinceDate(startDate);

  if (activities.length === 0) {
    console.log('No health activities found in the past 30 days.');
    return;
  }
  const normalizedActivities = normalizeActivities(activities);

  await syncDeviceActivities(normalizedActivities);
}

/**
 * Synchronize Apple Health data with backend.
 */
async function syncAllWithBackend() {
  try {
    // Check if Apple Health is linked to the user
    // TODO ...

    // Make sure Apple Healthkit is initialized
    await authenticate();
    await syncActivities();
    await syncLifestyle();
  } catch (e) {
    console.warn('Unable to sync Apple Health data with backend: ' + e);
  }
}

export const AppleHealthKitWrapper = {
  syncAllWithBackend,
};
