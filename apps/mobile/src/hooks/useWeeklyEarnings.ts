import {useEffect, useState} from 'react';

import api from '@api';

import {LeagueBfitEarnings} from '@fitlink/api/src/modules/leagues/entities/bfit-earnings.entity';
import {useQuery} from 'react-query';

const DAYS_IN_WEEK = 7;

function fetchWeeklyEarnings() {
  return api.list<LeagueBfitEarnings>('/leagues/bfit/earnings', {
    limit: DAYS_IN_WEEK,
  });
}

export const useWeeklyEarnings = () => {
  const [weeklyEarnings, setWeeklyEarnings] = useState<number[]>(
    new Array(DAYS_IN_WEEK).fill(0),
  );

  const {data, isLoading} = useQuery('weeklyEarnings', fetchWeeklyEarnings);

  useEffect(() => {
    if (data?.results?.length) {
      setWeeklyEarnings(data.results.map(earning => earning.bfit_amount));
    }
  }, [data]);

  return {
    isLoading,
    weeklyEarnings,
  };
};
