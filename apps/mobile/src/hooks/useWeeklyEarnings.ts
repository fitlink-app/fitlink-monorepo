import {useEffect, useState} from 'react';
import {useQuery} from 'react-query';

import api from '@api';
import {getViewBfitValue} from '@utils';
import {LeagueBfitEarnings} from '@fitlink/api/src/modules/leagues/entities/bfit-earnings.entity';

const DAYS_IN_WEEK = 7;

function fetchWeeklyEarnings(limit = DAYS_IN_WEEK) {
  return api.list<LeagueBfitEarnings>('/leagues/bfit/earnings', {
    limit,
  });
}

function extractBfitAmount(earning: LeagueBfitEarnings) {
  return earning.bfit_amount;
}

function getWeekSumEarnings(weeklyEarnings: number[]) {
  return weeklyEarnings.reduce((acc, cur) => acc + cur, 0);
}

export const useWeeklyEarnings = () => {
  const [weeklyEarnings, setWeeklyEarnings] = useState<number[]>(
    new Array(DAYS_IN_WEEK).fill(0),
  );
  const [percentsGrowth, setPercentsGrowth] = useState(0);
  const [currentWeekEarningsSum, setCurrentWeekEarningsSum] = useState(0);

  const currentDay = new Date().getDay();
  const currentDayShifted = currentDay === 0 ? DAYS_IN_WEEK : currentDay;
  const currentWeekLimit = currentDayShifted;
  const limit = currentWeekLimit + DAYS_IN_WEEK;

  const {data, isLoading} = useQuery('weeklyEarnings', () =>
    fetchWeeklyEarnings(limit),
  );

  useEffect(() => {
    if (data?.results?.length) {
      const prevWeekEarnings = data.results
        .slice(0, DAYS_IN_WEEK)
        .map(extractBfitAmount);
      const curWeekEarnings = data.results
        .slice(DAYS_IN_WEEK)
        .map(extractBfitAmount);

      const prevWeekSum = getWeekSumEarnings(prevWeekEarnings);
      const curWeekSum = getWeekSumEarnings(curWeekEarnings);

      setCurrentWeekEarningsSum(getViewBfitValue(curWeekSum));
      if (prevWeekSum === 0) {
        setPercentsGrowth(curWeekSum === 0 ? 0 : 100);
      } else {
        setPercentsGrowth(Math.trunc((curWeekSum / prevWeekSum) * 100));
      }

      setWeeklyEarnings(prev => [
        ...curWeekEarnings,
        ...prev.slice(curWeekEarnings.length),
      ]);
    }
  }, [data]);

  return {
    isLoading,
    weeklyEarnings,
    percentsGrowth,
    currentWeekEarningsSum,
  };
};
