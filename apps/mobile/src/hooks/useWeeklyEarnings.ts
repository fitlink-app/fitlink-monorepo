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

function getWeekSumEarnings(weeklyEarnings: number[]) {
  return weeklyEarnings.reduce((acc, cur) => acc + cur, 0);
}

function shiftDaysBack(date: Date, days: number) {
  return new Date(new Date().setDate(date.getDate() - days));
}

function getMonToSunDay(day: number) {
  return (day === 0 ? DAYS_IN_WEEK : day) - 1;
}

function getEarnings(breakdowns: Breakdown[], days: number) {
  const earnings = new Array(days).fill(0);
  breakdowns.forEach(breakdown => {
    const dayIndex = getMonToSunDay(new Date(breakdown.date).getDay());
    earnings[dayIndex] = breakdown.points;
  });
  return earnings;
}

export const useWeeklyEarnings = () => {
  const [weeklyEarnings, setWeeklyEarnings] = useState<number[]>(
    new Array(DAYS_IN_WEEK).fill(0),
  );
  const [percentsGrowth, setPercentsGrowth] = useState(0);
  const [currentWeekEarningsSum, setCurrentWeekEarningsSum] = useState(0);

  const currentDay = new Date().getDay();
  const currentDayShifted = getMonToSunDay(currentDay);

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
      const prevWeekEarnings = getEarnings(
        prevEarnings.breakdown,
        currentDayShifted,
      );
      const curWeekEarnings = getEarnings(
        currentEarnings.breakdown,
        DAYS_IN_WEEK,
      );

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
