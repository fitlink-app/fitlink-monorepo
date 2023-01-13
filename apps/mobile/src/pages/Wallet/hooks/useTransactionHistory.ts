import {TransactionUIModel} from '../types';
import {useCallback, useEffect, useState} from 'react';

function getRandomArbitrary(min: number, max: number): string {
  return (Math.random() * (max - min) + min).toFixed(2);
}

function generateStubTransaction(): TransactionUIModel {
  const amount = getRandomArbitrary(100, 500);
  const date = new Date(Date.now() - Math.random() * 1e12);
  const type = parseFloat(getRandomArbitrary(0, 1)) > 0.5 ? 'claim' : 'spend';
  const text =
    type === 'claim'
      ? 'Congrats! You finished 3rd place in the steps challenge league and earned 21 $BFIT.'
      : 'Nice one! You spent 159 $BFIT on a Garmin Watch Fenix 6S Pro as a Fitlink reward.';

  return {
    amount,
    date,
    text,
    type,
  };
}

async function fetchTransactionHistory(): Promise<TransactionUIModel[]> {
  return new Promise(res => {
    setTimeout(() => {
      const data: TransactionUIModel[] = [];
      for (let i = 0; i < 10; i++) {
        data.push(generateStubTransaction());
      }
      res(data);
    }, 1000);
  });
}

export function useTransactionHistory() {
  const [data, setData] = useState<TransactionUIModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    setData(await fetchTransactionHistory());
    setIsRefreshing(false);
  }, []);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      setData(await fetchTransactionHistory());
      setIsLoading(false);
    })();
  }, []);

  return {data, isLoading, isRefreshing, refresh};
}
