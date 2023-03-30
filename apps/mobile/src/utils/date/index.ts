import locale from 'date-fns/locale/en-US';
import {formatRelative} from 'date-fns';

type CountdownTime = {
  d: number;
  h: number;
  m: number;
  s: number;
};

/** Return the time difference between dates. Returns 0 if date is reached */
export function getTimeDifference(
  fromDate: Date,
  toDate: Date,
): CountdownTime | 0 {
  const from = new Date(fromDate);
  const to = new Date(toDate);
  let diff = to.getTime() - from.getTime();
  if (diff <= 0) {
    return 0;
  }

  // calculate (and subtract) whole days
  const d = Math.floor(diff / (1000 * 60 * 60 * 24));
  diff -= d * 1000 * 60 * 60 * 24;

  // calculate (and subtract) whole hours
  const h = Math.floor(diff / (1000 * 60 * 60));
  diff -= h * 1000 * 60 * 60;

  const m = Math.floor(diff / (1000 * 60));
  diff -= m * 1000 * 60;

  const s = Math.floor(diff / 1000);
  diff -= s * 1000;

  const timeDifference = {
    d,
    h,
    m,
    s,
  };

  return timeDifference;
}

/** Return the time remaining to date. Returns 0 if date is reached */
export function getTimeRemaining(toDate: Date): CountdownTime | 0 {
  return getTimeDifference(new Date(Date.now()), toDate);
}

export function formatDistanceShortLocale(token: string, count: any) {
  const formatDistanceLocale: {[key: string]: string} = {
    lessThanXSeconds: '{{count}}s',
    xSeconds: '{{count}}s',
    halfAMinute: '30s',
    lessThanXMinutes: '{{count}}m',
    xMinutes: '{{count}}m',
    aboutXHours: '{{count}}h',
    xHours: '{{count}}h',
    xDays: '{{count}}d',
    aboutXWeeks: '{{count}}w',
    xWeeks: '{{count}}w',
    aboutXMonths: '{{count}}m',
    xMonths: '{{count}}m',
    aboutXYears: '{{count}}y',
    xYears: '{{count}}y',
    overXYears: '{{count}}y',
    almostXYears: '{{count}}y',
  };

  const result = formatDistanceLocale[token].replace('{{count}}', count);

  return result as any;
}

export function formatDateWithoutOffset(
  date: Date | number,
  baseDate: Date | number,
) {
  const localOffsetInMs = new Date().getTimezoneOffset() * 60 * 1000;
  const offsetedDate = new Date(date.valueOf() + localOffsetInMs);

  return formatRelative(offsetedDate, baseDate, {
    locale: {
      ...locale,
      formatRelative: token => {
        const formattings: {[key: string]: string} = {
          lastWeek: "EEEE 'at' h:mm a",
        };

        return (
          formattings[token] ||
          (locale.formatRelative && locale.formatRelative(token))
        );
      },
    },
  });
}

export function durationToMinutesCountdown(duration: Duration) {
  let result = '';

  function addToResult(amount?: string) {
    result += (result.length ? ':' : '') + amount;
  }

  addToResult(duration.hours?.toString().padStart(2, '0'));
  addToResult(duration.minutes?.toString().padStart(2, '0'));

  return result;
}

export function durationToCountDown(duration: Duration) {
  let result = '';

  function addToResult(amount?: string) {
    result += (result.length ? ':' : '') + amount;
  }

  addToResult(duration.minutes?.toString());
  addToResult(duration.seconds?.toString().padStart(2, '0'));

  return result;
}
export function formatDate(date: any): string {
  if (!date) {
    return '';
  }
  var d = new Date(date),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) {
    month = '0' + month;
  }
  if (day.length < 2) {
    day = '0' + day;
  }

  return [day, month, year].join('-');
}

export * from './rewards';
