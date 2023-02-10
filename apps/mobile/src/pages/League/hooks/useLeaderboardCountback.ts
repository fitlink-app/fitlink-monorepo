import {useEffect, useState} from 'react';
import {getTimeRemaining} from '@utils';

interface Props {
  date: Date;
  repeat: boolean;
}

export const useLeaderboardCountback = ({
  date,
  repeat,
}: Props): string | null => {
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  useEffect(() => {
    const getTimeRemainingString = (date: Date): string | null => {
      const countdownTime = getTimeRemaining(date);

      /** If date is reached, return null and clear the interval */
      if (countdownTime === 0) {
        return repeat ? 'resets in 1 day' : 'ended';
      }
      const daysLeft = countdownTime.d || 1; // leaderboards update tasks run every 12 hour so we can't be more accurate with this

      let displayString = `${daysLeft} day${daysLeft === 1 ? '' : 's'}`;

      return (repeat ? 'resets in ' : 'ends in ') + displayString;
    };

    const updateTimeRemaining = (interval?: NodeJS.Timeout) => {
      const timeRemaining = getTimeRemainingString(date);

      timeRemaining
        ? setTimeRemaining(timeRemaining)
        : interval && clearInterval(interval);
    };

    updateTimeRemaining();
    const interval = setInterval(() => {
      updateTimeRemaining(interval);
    }, 1000 * 30);

    return () => clearInterval(interval);
  }, [date, repeat]);

  if (!date) {
    return null;
  }

  return timeRemaining;
};
