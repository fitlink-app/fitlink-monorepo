import {useEffect, useMemo, useState} from 'react';
import {getTimeDifference, getTimeRemaining} from '@utils';

interface Props {
  resetDate: Date;
  startDate: Date;
  repeat: boolean;
}

interface Result {
  daysRemaining: number;
  daysTotal: number;
}

export const useLeaderboardCountback = ({
  resetDate,
  startDate,
  repeat,
}: Props): Result | null => {
  const [daysRemaining, setDaysRemaining] = useState<number>(-1);

  useEffect(() => {
    const getDaysRemaining = (date: Date): number | null => {
      const countdownTime = getTimeRemaining(date);

      /** If date is reached, return null and clear the interval */
      if (countdownTime === 0) {
        return repeat ? 1 : null;
      }
      return countdownTime.d || 1; // leaderboards update tasks run every 12 hour so we can't be more accurate with this
    };

    const updateTimeRemaining = (interval?: NodeJS.Timeout) => {
      const timeRemaining = getDaysRemaining(resetDate);

      timeRemaining
        ? setDaysRemaining(timeRemaining)
        : interval && clearInterval(interval);
    };

    updateTimeRemaining();
    const interval = setInterval(() => {
      updateTimeRemaining(interval);
    }, 1000 * 30);

    return () => clearInterval(interval);
  }, [resetDate, repeat]);

  const daysTotal = useMemo(() => {
    const timeDifference = getTimeDifference(startDate, resetDate);
    if (timeDifference === 0) {
      return -1;
    }
    return timeDifference.d || 1;
  }, [resetDate, startDate]);

  if (!resetDate) {
    return null;
  }

  return {
    daysTotal,
    daysRemaining,
  };
};
