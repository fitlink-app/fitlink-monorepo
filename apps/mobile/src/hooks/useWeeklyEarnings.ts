import {useEffect, useState} from 'react';
import {useQuery} from 'react-query';

import api from '@api';

const DAYS_IN_WEEK = 7;

type Breakdown = {
  points: number;
  date: Date;
};

type Earnings = {
  total: number;
  breakdown: Breakdown[];
};

function fetchWeeklyEarnings(startDate: Date, endDate: Date) {
  return api.get<Earnings>('/me/points', {
    query: {
      startDate: startDate.toJSON(),
      endDate: endDate.toJSON(),
    },
  });
}

function extractPointsAmount(earning: Breakdown) {
  return earning.points;
}

function getWeekSumEarnings(weeklyEarnings: number[]) {
  return weeklyEarnings.reduce((acc, cur) => acc + cur, 0);
}

function shiftDaysBack(date: Date, days: number) {
  return new Date(new Date().setDate(date.getDate() - days));
}

export const useWeeklyEarnings = () => {
  const [weeklyEarnings, setWeeklyEarnings] = useState<number[]>(
    new Array(DAYS_IN_WEEK).fill(0),
  );
  const [percentsGrowth, setPercentsGrowth] = useState(0);
  const [currentWeekEarningsSum, setCurrentWeekEarningsSum] = useState(0);

  const currentDay = new Date().getDay();
  const currentDayShifted = (currentDay === 0 ? DAYS_IN_WEEK : currentDay) - 1;

  const today = new Date();
  const monday = shiftDaysBack(today, currentDayShifted);
  const prevSunday = shiftDaysBack(monday, 1);
  const prevMonday = shiftDaysBack(monday, 7);

  const {data: currentEarnings} = useQuery('weeklyEarnings/current', () =>
    fetchWeeklyEarnings(monday, today),
  );
  const {data: prevEarnings} = useQuery('weeklyEarnings/previous', () =>
    fetchWeeklyEarnings(prevMonday, prevSunday),
  );

  useEffect(() => {
    if (currentEarnings && prevEarnings) {
      const prevWeekEarnings = prevEarnings.breakdown.map(extractPointsAmount);
      const curWeekEarnings =
        currentEarnings.breakdown.map(extractPointsAmount);

      const prevWeekSum = getWeekSumEarnings(prevWeekEarnings);
      const curWeekSum = getWeekSumEarnings(curWeekEarnings);

      setCurrentWeekEarningsSum(curWeekSum);
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
  }, [currentEarnings, prevEarnings]);

  return {
    weeklyEarnings,
    percentsGrowth,
    currentWeekEarningsSum,
  };
};
