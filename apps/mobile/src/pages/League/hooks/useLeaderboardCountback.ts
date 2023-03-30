import {useEffect, useState} from 'react';
import {getTimeRemaining} from '@utils';

interface Props {
  resetDate?: Date;
  startDate: Date;
}

export enum CountbackType {
  DAYS = 'DAYS',
  HOURS = 'HOURS',
  MINUTES = 'MIN',
}

export interface Countback {
  progress: number;
  countdownString: string;
  countbackType: CountbackType;
}

export const useLeaderboardCountback = ({
  resetDate,
  startDate,
}: Props): Countback | null => {
  const [progress, setProgress] = useState<number>(0);
  const [countdownString, setCountdownString] = useState<string>('');
  const [countbackType, setCountbackType] = useState<CountbackType>(
    CountbackType.DAYS,
  );

  useEffect(() => {
    const getDaysRemaining = (
      date: Date,
    ): {countdownString: string; type: CountbackType} | null => {
      const countdownTime = getTimeRemaining(date);
      /** If date is reached, return null and clear the interval */
      if (countdownTime === 0) {
        return null;
      }
      if (countdownTime.d === 0) {
        if (countdownTime.h === 0) {
          return {
            countdownString: String(countdownTime.m),
            type: CountbackType.MINUTES,
          };
        }
        return {
          countdownString: String(countdownTime.h),
          type: CountbackType.HOURS,
        };
      }
      return {
        countdownString: String(countdownTime.d),
        type: CountbackType.DAYS,
      };
    };

    const updateTimeRemaining = (interval?: NodeJS.Timeout) => {
      if (!resetDate) {
        return;
      }
      const timeRemaining = getDaysRemaining(resetDate);
      if (timeRemaining === null) {
        setProgress(0);
        setCountdownString('0');
        setCountbackType(CountbackType.MINUTES);
        interval && clearInterval(interval);
        return;
      }
      const total = resetDate ? resetDate.getTime() - startDate.getTime() : 0;
      setProgress((resetDate.getTime() - Date.now()) / total);
      setCountdownString(timeRemaining.countdownString);
      setCountbackType(timeRemaining.type);
      return;
    };

    updateTimeRemaining();
    const interval = setInterval(() => {
      updateTimeRemaining(interval);
    }, 1000 * 30);

    return () => clearInterval(interval);
  }, []);

  if (!resetDate) {
    return null;
  }

  return {
    countbackType,
    countdownString,
    progress,
  };
};
