import {useEffect, useState} from 'react';

async function fetchWeeklyEarnings(): Promise<number[]> {
  return new Promise(res => {
    setTimeout(() => {
      res([0.2, 0.1, 0.5, 0.6, 0.9, 0.5, 0.4]);
    }, 300);
  });
}

export const useWeeklyEarnings = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [weeklyEarnings, setWeeklyEarnings] = useState<number[]>([
    0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1,
  ]);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      setWeeklyEarnings(await fetchWeeklyEarnings());
      setIsLoading(false);
    })();
  }, []);

  return {
    isLoading,
    weeklyEarnings,
  };
};
